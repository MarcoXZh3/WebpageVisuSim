'''
Created on Mar 28, 2015

@author: MarcoXZh
'''
import requests, urllib2, sqlite3, os, re, random
from urlparse import urlparse
from lxml import html


def getTopSites(number):
    '''
    Retrieve the top web sites from Alexa (http://www.alexa.com/topsites)
    '''
    assert type(number) is int and 0 < number <= 500
    results = []
    urls = set()
    lenURLs = len(urls)
    index = 1
    page = 0
    while page < 20:
        links = []
        try:
            links = html.fromstring(requests.request('GET', 'http://www.alexa.com/topsites/global;%d' % page, \
                                                     timeout=5).text) \
                        .xpath('//p[@class=\"desc-paragraph\"]/a/text()')
        except:
            pass
        for link in links:
            if index <= number:
                url = ''
                try:
                    url = urllib2.urlopen('http://' + link).geturl()
                except:
                    continue
                if len(url) == 0:
                    continue
                urls.add(url)
                if lenURLs != len(urls):
                    lenURLs = len(urls)
                    results.append((index, link.strip(), url, 0))
                    index += 1
                    print results[-1]
                pass # if lenURLs != len(urls)
            pass # if len(url) != 0 and url not in urls
        pass # for - if
        page += 1
    pass # while page < 20
    conn = sqlite3.connect('databases/webpages.db')
    c = conn.cursor()
    c.execute('CREATE TABLE pages0_150327 (number int primary key, name text, url text, duplicate int);')
    c.executemany('INSERT INTO pages0_150327 VALUES (?, ?, ?, ?)', results)
    conn.commit()
pass # def getTopSites(number)

def crawlPagesLevel1(pageExts):
    conn = sqlite3.connect('databases/webpages.db')
    c = conn.cursor()
    c.execute('CREATE TABLE pages1_150328 (number int primary key, url text);')
    c.execute('SELECT * FROM pages0_150327;')
    urls = c.fetchall()
    lenURLs = len(urls)
    index = 1
    for url in urls:
        resultSet = set()
        try:
            resultSet = crawlPage(url[2], pageExts)
        except:
            continue
        rows = []
        for rs in resultSet:
            rows.append((index, rs))
            index += 1
        pass # for rs in resultSet
        c.executemany('INSERT INTO pages1_150328 VALUES (?, ?)', rows)
        conn.commit()
        print '%5d/%d: %s' % (index, lenURLs, url[2])
    pass # for url in urls
pass # def crawlPagesLevel1(pageExts)

def crawlPagesLevel2(pageExts):
    conn = sqlite3.connect('databases/webpages.db')
    c = conn.cursor()
    conn1 = sqlite3.connect('databases/webpages1.db')
    c1 = conn1.cursor()
    c1.execute('CREATE TABLE pages2_150330 (number int primary key, url text);')
    c.execute('SELECT * FROM pages1_150328;')
    urls = c.fetchall()
    lenURLs = len(urls)
    '''
    Exception 1: pages1_150328<number=15185>, pages2_150330<number= 2,992,609> ~~ terminated;
    Exception 2: pages1_150328<number=44778>, pages2_150330<number= 8,737,160> ~~ non-respond;
    Exception 3: pages1_150328<number=44779>, pages2_150330<number= 8,737,160> ~~ non-respond;
    Exception 4: pages1_150328<number=55458>, pages2_150330<number=10,812,860> ~~ non-respond;
    Exception 5: pages1_150328<number=55459>, pages2_150330<number=10,812,860> ~~ non-respond;
    Exception 6: pages1_150328<number=57388>, pages2_150330<number=11,181,762> ~~ terminated;
    Exception 7: pages1_150328<number=57389>, pages2_150330<number=11,181,762> ~~ terminated;
    '''
    index = 1
    urlIndex = 1
    for url in urls:
        resultSet = crawlPage(url[1], pageExts)
        rows = []
        for rs in resultSet:
            rows.append((index, rs))
            index += 1
        pass # for rs in resultSet
        if len(rows) != 0:
            c1.executemany('INSERT INTO pages2_150330 VALUES (?, ?)', rows)
            conn1.commit()
        pass # if len(rows) != 0
        print '%5d/%d: %s' % (urlIndex, lenURLs, url[1])
        urlIndex += 1
    pass # for url in urls
pass # def crawlPagesLevel2(pageExts)

def removeInvalid(table, urlPattern):
    conn = sqlite3.connect('databases/webpages.db')
    c = conn.cursor()
    c.execute('SELECT count(*) FROM %s;' % table)
    numbers = c.fetchone()[0]
    step = 4096
    end = numbers / step + 1 if numbers % step != 0 else numbers / step
    for i in range(0, end):
        print '%4d/%d: Remove invalid URL' % (i, end)
        c.execute('SELECT * FROM %s WHERE number > %d AND number <= %d;' % (table, i * step, (i + 1) * step))
        urls = c.fetchall()
        for url in urls:
            if not re.match(urlPattern, url[1]):
                c.execute('DELETE FROM %s WHERE number = %d;' % (table, url[0]))
                print '    %8d/%d: %s' % (url[0], numbers, repr(url[1]))
        pass # for - if
        conn.commit()
    pass # for i in range(0, end)
    print 'Original records: %d' % numbers
    print 'Current records : %d' % c.execute('SELECT count(*) FROM %s;' % table).fetchone()[0]
pass #def removeInvalid(table, urlPattern)

def updateIndex(table):
    conn = sqlite3.connect('databases/webpages.db')
    c = conn.cursor()
    c.execute('SELECT * FROM %s ORDER BY number DESC LIMIT 1;' % table)
    numbers = c.fetchone()[0]
    step = 4096
    end = numbers / step + 1 if numbers % step != 0 else numbers / step
    index = 1
    for i in range(0, end):
        print '%4d/%d: Update index' % (i, end)
        c.execute('SELECT * FROM %s WHERE number > %d AND number <= %d;' % (table, i * step, (i + 1) * step))
        urls = c.fetchall()
        for url in urls:
            if url[0] != index:
                c.execute('UPDATE %s SET number=%d WHERE number=%d' % (table, index, url[0]))
                #print '    %8d/%d: => %8d, %s' % (url[0], numbers, index, repr(url[1]))
            pass # if url[0] != index
            index += 1
        pass # for url in urls
        conn.commit()
    pass # for i in range(0, end)
pass # def updateIndex(table)

def crawlPage(url, pageExts):
    try:
        results = set()
        links = html.fromstring(requests.request('GET', url.strip(), timeout=5).text).xpath('//a')
        for link in links:
            href = link.attrib.get('href')
            if href is None:
                continue
            href = href.strip()
            if '#' in href:
                href = href[:href.index('#')]
            if href.startswith('/'):
                host = urlparse(url.strip())
                href = '%s://%s%s' % (host.scheme, host.netloc, href)
            pass # if href.startswith('/')
            ext = os.path.splitext(urlparse(href.strip()).path)[1]
            if ext not in pageExts:
                continue
            results.add(href)
        pass # for link in links
        return results
    except:
        return set()
pass # def crawlPage(url, pageExts)

def getLinks(step):
    conn = sqlite3.connect('databases/webpages.db')
    c = conn.cursor()
    c.execute('SELECT * FROM pages1_150328 ORDER BY number DESC LIMIT 1;')
    numbers = c.fetchone()[0]
    end = numbers / step + 1 if numbers % step != 0 else numbers / step
    links = []
    for i in range(0, end):
        c.execute('SELECT * FROM pages1_150328 WHERE number > %d AND number <= %d;' % (i * step, (i + 1) * step))
        urls = c.fetchall()
        links.append(urls[random.randint(0, len(urls)- 1)])
        print '%d/%d' % (i, end)
    pass # for i in range(0, end)

    f = open('GestaltPS/lib/preferences.js', 'w')
    f.write('const prefGestaltPS =\n')
    for link in links:
        u = repr(link[1])[2:-1]
        if '\\x' not in u and '\\u' not in u:
            f.write('  \'%s~~\' +\n' % u)
    pass # for link in links
    f.write('exports.prefGestaltPS = prefGestaltPS;\n')
    f.close()
pass # def getLinks(step)

def clearFiles(directory):
    path = os.path.join('databases', directory)
    files = os.listdir(path)
    files.sort()
    index = 0
    while index < len(files):
        if files[index][:-4] == files[index+1][:-4] and os.path.getsize(os.path.join(path, files[index])) != 0L:
            files.pop(index+1)
            files.pop(index)
        else:
            index += 1
    pass # while index < len(files)
    print len(files)
    for i in range(0, len(files)):
        os.rename(os.path.join(path, files[i]), os.path.join(path, '%d.%s' % (i, files[i][-3:])))
pass # def clearFiles(directory)

def randomLinks(numbers):
    conn = sqlite3.connect('databases/webpages.db')
    c = conn.cursor()
#     c.execute('SELECT * FROM pages1_150328 ORDER BY number DESC LIMIT 1;')
#     print c.fetchone()[1]
    c.execute('SELECT count(*) FROM pages2_150330;')
    total = c.fetchone()[0]
    urls = set()
    while len(urls) < numbers:
        i = random.randint(0, total)
        c.execute('SELECT * FROM pages2_150330 WHERE number = %d;' % i)
        urls.add(c.fetchone()[1])
    pass # while len(urls) < numbers
    for r in sorted(urls):
        print r
pass # def randomLinks(numbers)


if __name__ == '__main__':
    pageExts = ['.html', '.htm', '.php', '.jsp', '.asp', '.aspx', '.c', '.srf', '']

    # Django's validator
    # https://github.com/django/django/blob/master/django/core/validators.py
    urlPattern = re.compile(
                    r'^(?:http|ftp)s?://'                                                   # http:// or https://
                    r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # domain...
                    r'localhost|'                                                           # localhost...
                    r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|'                                  # ...or ipv4
                    r'\[?[A-F0-9]*:[A-F0-9:]+\]?)'                                          # ...or ipv6
                    r'(?::\d+)?'                                                            # optional port
                    r'(?:/?|[/?]\S+)$', re.IGNORECASE)

    # Step 1: retrieve the top 500 top sites
    #getTopSites(500)

    # Step 2(Manually): remove improper sites and mark duplications

    # Stop 3: Crawl all direct links from the top 500 sites - Level 1
    #crawlPagesLevel1(pageExts)

    # Step 4: Crawl all direct links from previous links - Level 2
    #crawlPagesLevel1(pageExts)

    # Step 5: remove invalid URLs
    #removeInvalid('pages1_150328', urlPattern)
    #removeInvalid('pages2_150330', urlPattern)

    # Step 6: update records' indexes
    #updateIndex('pages0_150327')
    #updateIndex('pages1_150328')
    #updateIndex('pages2_150330')

    # Step 7: get sample URLs
    #getLinks(64)

    # Step 8: clear files so only PNG and corresponding TXT dump left
    #clearFiles('all')

#     randomLinks(500)
pass # if __name__ == '__main__'
