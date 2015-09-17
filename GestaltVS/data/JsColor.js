/**
 * JavaScript Implementation of 'Color' class
 * @author  MarcoXZh
 * @version  1.1
 */
function JsColor(para1, para2, para3, para4) {
  var hasAlpha = false;
  var a = 0.0;
  var r = 0;
  var g = 0;
  var b = 0;

  /**
   * Method: Get red channel of the color
   */
  this.getRed = function() {
    return r;
  }; // this.getRed = function() {...};

  /**
   * Method: Set red channel of the color
   */
  this.setRed = function(red) {
    try {
      if (red == null || red == undefined || typeof red != 'number')
        throw 'JsColor.setRed(red) - Parameter error: ';
      r = Math.abs(red);
      r = (r < 1.0) ? Math.round(r * 256.0) : Math.round(r) % 256;
    } catch (err) {
      if (typeof red == 'string')
        red = '"' + red + '"';
      console.log(err + red);
    } // try - catch(err)
  }; // this.setRed = function(red) {...};

  /**
   * Method: Get green channel of the color
   */
  this.getGreen = function() {
    return g;
  }; // this.getGreen = function() {...};

  /**
   * Method: Set green channel of the color
   */
  this.setGreen = function(green) {
    try {
      if (green == null || green == undefined || typeof green != 'number')
        throw 'JsColor.setGreen(green) - Parameter error: ';
      g = Math.abs(green);
      g = (g < 1.0) ? Math.round(g * 256.0) : Math.round(g) % 256;
    } catch (err) {
      if (typeof green == 'string')
        green = '"' + green + '"';
      console.log(err + green);
    } // try - catch(err)
  }; // this.setGreen = function(green) {...};

  /**
   * Method: Get blue channel of the color
   */
  this.getBlue = function() {
    return b;
  }; // this.getBlue = function() {...};

  /**
   * Method: Set blue channel of the color
   */
  this.setBlue = function (blue) {
    try {
      if (blue == null || blue == undefined || typeof blue != 'number')
        throw 'JsColor.setBlue(blue) - Parameter error: ';
      b = Math.abs(blue);
      b = (b < 1.0) ? Math.round(b * 256.0) : Math.round(b) % 256;
    } catch (err) {
      if (typeof blue == 'string')
        blue = '"' + blue + '"';
      console.log(err + blue);
    } // try - catch(err)
  }; // this.setBlue = function (blue) {...};

  /**
   * Method: Check if the alpha channel of the color exists or not
   */
  this.hasAlphaChannel = function() {
    return hasAlpha;
  }; // this.hasAlphaChannel = function() {...};

  /**
   * Method: Get alpha channel of the color
   */
  this.getAlpha = function() {
    return (hasAlpha) ? a : null;
  }; // this.getAlpha = function() {...};

  /**
   * Method: Set alpha channel of the color
   */
  this.setAlpha = function(alpha) {
    try {
      if (alpha == null || alpha == undefined || typeof alpha != 'number')
        throw 'JsColor.setAlpha(alpha) - Parameter error: ';
      a = Math.abs(alpha);
      if (a > 1.0)
        a /= Math.pow(10.0, Math.ceil(Math.log10(a)));
      hasAlpha = true;
    } catch (err) {
      if (typeof alpha == 'string')
        alpha = '"' + alpha + '"';
      console.log(err + alpha);
    } // try - catch(err)
  }; // this.setAlpha = function(alpha) {...};

  /**
   * Method: Check if is transparent
   */
  this.isTransparent = function() {
    return hasAlpha && a == 0.0;
  }; // this.getColor = function() {...};

  /**
   * Method: Get color value
   */
  this.getColor = function() {
    var rgb = r * 65536 + g * 256 + b;
    return hasAlpha ? Math.round(rgb * 256 + a * 255) : rgb;
  }; // this.getColor = function() {...};

  /**
   * Method: Set the color with parameters
   */
  this.setColor = function(para1, para2, para3, para4) {
    try {
      if (typeof para1 == 'number' && typeof para2 == 'number' && typeof para3 == 'number') {
        this.setRed(para1);
        this.setGreen(para2);
        this.setBlue(para3);
        if (para4)
          this.setAlpha(para4);
        else
          hasAlpha = false;
      } else if (typeof para1 == 'number' && !para2 && ! para3 && !para4) {
        var rgb = Math.round(Math.abs(para1));
        if (rgb > 0xFFFFFF) {
          hasAlpha = true;
          a = (rgb % 256) / 255.0;
          rgb = Math.floor(rgb / 256);
        } else
          hasAlpha = false;
        b = rgb % 256;
        rgb = Math.floor(rgb / 256);
        g = rgb % 256;
        r = Math.floor(rgb / 256);
      } else if (typeof para1 == 'string' && para1.length != 0 && !para2 && ! para3 && !para4) {
        var para = para1.replace(/\s+/g, '').toUpperCase();
        if (para == 'TRANSPARENT') {
          this.setRed(0);
          this.setGreen(0);
          this.setBlue(0);
          hasAlpha = true;
          this.setAlpha(0.0);
        } else if (para.match(/RGB\(\d{1,3},\d{1,3},\d{1,3}\)/) != null) {
          var rgb = para.match(/\d+/g);
          this.setRed(parseInt(rgb[0]));
          this.setGreen(parseInt(rgb[1]));
          this.setBlue(parseInt(rgb[2]));
          hasAlpha = false;
        } else if (para.match(/RGBA\(\d{1,3},\d{1,3},\d{1,3}\,\d*\.*\d+\)/) != null) {
          var rgba = para.match(/\d*\.*\d+/g);
          this.setRed(parseInt(rgba[0]));
          this.setGreen(parseInt(rgba[1]));
          this.setBlue(parseInt(rgba[2]));
          this.setAlpha(parseFloat(rgba[3]));
          hasAlpha = true;
        } else if (para.match(/^(0x[0-9A-F]+|\d+)$/) != null) {
          this.setColor(parseInt(para));
        } else if (para.match(/^#[0-9A-F]+$/) != null) {
          para = para.substr(1);
          if (para.length == 3) {
            this.setRed(parseInt(para[0] + para[0], 16));
            this.setGreen(parseInt(para[1] + para[1], 16));
            this.setBlue(parseInt(para[2] + para[2], 16));
            hasAlpha = false;
          } else if (para.length == 4) {
            this.setRed(parseInt(para[0] + para[0], 16));
            this.setGreen(parseInt(para[1] + para[1], 16));
            this.setBlue(parseInt(para[2] + para[2], 16));
            this.setAlpha(parseInt(para[3] + para[3], 16) / 255);
            hasAlpha = true;
          } else if (para.length == 6) {
            this.setRed(parseInt(para.substr(0, 2), 16));
            this.setGreen(parseInt(para.substr(2, 2), 16));
            this.setBlue(parseInt(para.substr(4, 2), 16));
            hasAlpha = false;
          } else if (para.length == 8) {
            this.setRed(parseInt(para.substr(0, 2), 16));
            this.setGreen(parseInt(para.substr(2, 2), 16));
            this.setBlue(parseInt(para.substr(4, 2), 16));
            this.setAlpha(parseInt(para.substr(6, 2), 16) / 255);
            hasAlpha = true;
          } else 
            throw 'JsColor.setColor(para1, para2, para3, para4) - Parameter error:\n';
        } else if (JsColor.colors.hasOwnProperty(para)) {
          var color = JsColor.colors[para];
          this.setRed(color.getRed());
          this.setGreen(color.getGreen());
          this.setBlue(color.getBlue());
        } else
          throw 'JsColor.setColor(para1, para2, para3, para4) - Parameter error:\n';
      } else
        throw 'JsColor.setColor(para1, para2, para3, para4) - Parameter error:\n';
    } catch (err) {
      if (typeof para1 == 'string')
        para1 = '"' + para1 + '"';
      if (typeof para2 == 'string')
        para2 = '"' + para2 + '"';
      if (typeof para3 == 'string')
        para3 = '"' + para3 + '"';
      if (typeof para4 == 'string')
        para4 = '"' + para4 + '"';
      console.log(err + '  ' + para1 + '\n  ' + para2 + '\n  ' + para3 + '\n  ' + para4);
    } // try - catch(err)
  }; // this.setColor = function(para1, para2, para3, para4) {...};

  /**
   * Method: Check if this color equals to another JsColor
   */
  this.equals = function(jsColor) {
    if (this === jsColor)
      return true;
    if (!jsColor || !(jsColor instanceof JsColor))
      return false;
    return this.getColor() == jsColor.getColor();
  }; // this.equals = function(jsColor) {...};

  /**
   * Method: Hexadecimal representation of the color
   */
  this.toString = function() {
    var digits = ['0', '1', '2', '3', '4', '5', '6', '7',
                  '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
    var str = '#';
    str += digits[Math.floor(r / 16)] + digits[r % 16];
    str += digits[Math.floor(g / 16)] + digits[g % 16];
    str += digits[Math.floor(b / 16)] + digits[b % 16];
    if (hasAlpha)
      str += digits[Math.floor(Math.round(a * 255) / 16)] + digits[Math.round(a * 255) % 16];
    return str;
  }; // this.toString = function() {...};

  /**
   * Method: Print the color as a string
   */
  this.printColor = function() {
    var str = (hasAlpha) ? 'RGBA(' : 'RGB(';
    str += r + ',' + g + ',' + b;
    return (hasAlpha) ? str + ',' + a.toFixed(2) + ')' : str + ')';
  }; // this.printColor = function() {...};

  this.setColor(para1, para2, para3, para4);
} // function JsColor(para1, para2, para3, para4)

/**
 * Property: Predefined color names
 */
JsColor.colorNames = [
  'aliceblue',      'antiquewhite',         'aqua',              'aquamarine',      'azure',            //   1 -   5
  'beige',          'bisque',               /*'black',*/         'blanchedalmond',  'blue',             //   6 -  10
  'blueviolet',     'brown',                'burlywood',         'cadetblue',       'chartreuse',       //  11 -  15
  'chocolate',      'coral',                'cornflowerblue',    'cornsilk',        'crimson',          //  16 -  20
  'cyan',           'darkblue',             'darkcyan',          'darkgoldenrod',   'darkgray',         //  21 -  25
  'darkgreen',      'darkkhaki',            'darkmagenta',       'darkolivegreen',  'darkorange',       //  26 -  30
  'darkorchid',     'darkred',              'darksalmon',        'darkseagreen',    'darkslateblue',    //  31 -  35
  'darkslategray',  'darkturquoise',        'darkviolet',        'deeppink',        'deepskyblue',      //  36 -  40
  'dimgray',        'dodgerblue',           'firebrick',         'floralwhite',     'forestgreen',      //  41 -  45
  'fuchsia',        'gainsboro',            'ghostwhite',        'gold',            'goldenrod',        //  46 -  50
  'gray',           'green',                'greenyellow',       'honeydew',        'hotpink',          //  51 -  55
  'indianred',      'indigo',               'ivory',             'khaki',           'lavender',         //  56 -  60
  'lavenderblush',  'lawngreen',            'lemonchiffon',      'lightblue',       'lightcoral',       //  61 -  65
  'lightcyan',      'lightgoldenrodyellow', 'lightgray',         'lightgreen',      'lightpink',        //  66 -  70
  'lightsalmon',    'lightseagreen',        'lightskyblue',      'lightslategray',  'lightsteelblue',   //  71 -  75
  'lightyellow',    'lime',                 'limegreen',         'linen',           'magenta',          //  76 -  80
  'maroon',         'mediumaquamarine',     'mediumblue',        'mediumorchid',    'mediumpurple',     //  81 -  85
  'mediumseagreen', 'mediumslateblue',      'mediumspringgreen', 'mediumturquoise', 'mediumvioletred',  //  86 -  90
  'midnightblue',   'mintcream',            'mistyrose',         'moccasin',        'navajowhite',      //  91 -  95
  'navy',           'oldlace',              'olive',             'olivedrab',       'orange',           //  96 - 100
  'orangered',      'orchid',               'palegoldenrod',     'palegreen',       'paleturquoise',    // 101 - 105
  'palevioletred',  'papayawhip',           'peachpuff',         'peru',            'pink',             // 106 - 110
  'plum',           'powderblue',           'purple',            'red',             'rosybrown',        // 111 - 115
  'royalblue',      'saddlebrown',          'salmon',            'sandybrown',      'seagreen',         // 116 - 120
  'seashell',       'sienna',               'silver',            'skyblue',         'slateblue',        // 121 - 125
  'slategray',      'snow',                 'springgreen',       'steelblue',       'tan',              // 126 - 130
  'teal',           'thistle',              'tomato',            'turquoise',       'violet',           // 131 - 135
  'wheat',          /*'white',*/            'whitesmoke',        'yellow',          'yellowgreen'       // 136 - 140
]; // JsColor.colorNames = [ ... ];

/**
 * Property: Predefined colors
 */
JsColor.colors = {
    'aliceblue'           : new JsColor(0xF0F8FF), /*   1 */    'antiquewhite'     : new JsColor(0xFAEBD7), /*   2 */
    'aqua'                : new JsColor(0x00FFFF), /*   3 */    'aquamarine'       : new JsColor(0x7FFFD4), /*   4 */
    'azure'               : new JsColor(0xF0FFFF), /*   5 */    'beige'            : new JsColor(0xF5F5DC), /*   6 */
    'bisque'              : new JsColor(0xFFE4C4), /*   7 */  /*'black'            : new JsColor(0x000000), /*   8 */
    'blanchedalmond'      : new JsColor(0xFFEBCD), /*   9 */    'blue'             : new JsColor(0x0000FF), /*  10 */
    'blueviolet'          : new JsColor(0x8A2BE2), /*  11 */    'brown'            : new JsColor(0xA52A2A), /*  12 */
    'burlywood'           : new JsColor(0xDEB887), /*  13 */    'cadetblue'        : new JsColor(0x5F9EA0), /*  14 */
    'chartreuse'          : new JsColor(0x7FFF00), /*  15 */    'chocolate'        : new JsColor(0xD2691E), /*  16 */
    'coral'               : new JsColor(0xFF7F50), /*  17 */    'cornflowerblue'   : new JsColor(0x6495ED), /*  18 */
    'cornsilk'            : new JsColor(0xFFF8DC), /*  19 */    'crimson'          : new JsColor(0xDC143C), /*  20 */
    'cyan'                : new JsColor(0x00FFFF), /*  21 */    'darkblue'         : new JsColor(0x00008B), /*  22 */
    'darkcyan'            : new JsColor(0x008B8B), /*  23 */    'darkgoldenrod'    : new JsColor(0xB8860B), /*  24 */
    'darkgray'            : new JsColor(0xA9A9A9), /*  25 */    'darkgreen'        : new JsColor(0x006400), /*  26 */
    'darkkhaki'           : new JsColor(0xBDB76B), /*  27 */    'darkmagenta'      : new JsColor(0x8B008B), /*  28 */
    'darkolivegreen'      : new JsColor(0x556B2F), /*  29 */    'darkorange'       : new JsColor(0xFF8C00), /*  30 */
    'darkorchid'          : new JsColor(0x9932CC), /*  31 */    'darkred'          : new JsColor(0x8B0000), /*  32 */
    'darksalmon'          : new JsColor(0xE9967A), /*  33 */    'darkseagreen'     : new JsColor(0x8FBC8F), /*  34 */
    'darkslateblue'       : new JsColor(0x483D8B), /*  35 */    'darkslategray'    : new JsColor(0x2F4F4F), /*  36 */
    'darkturquoise'       : new JsColor(0x00CED1), /*  37 */    'darkviolet'       : new JsColor(0x9400D3), /*  38 */
    'deeppink'            : new JsColor(0xFF1493), /*  39 */    'deepskyblue'      : new JsColor(0x00BFFF), /*  40 */
    'dimgray'             : new JsColor(0x696969), /*  41 */    'dodgerblue'       : new JsColor(0x1E90FF), /*  42 */
    'firebrick'           : new JsColor(0xB22222), /*  43 */    'floralwhite'      : new JsColor(0xFFFAF0), /*  44 */
    'forestgreen'         : new JsColor(0x228B22), /*  45 */    'fuchsia'          : new JsColor(0xFF00FF), /*  46 */
    'gainsboro'           : new JsColor(0xDCDCDC), /*  47 */    'ghostwhite'       : new JsColor(0xF8F8FF), /*  48 */
    'gold'                : new JsColor(0xFFD700), /*  49 */    'goldenrod'        : new JsColor(0xDAA520), /*  50 */
    'gray'                : new JsColor(0x808080), /*  51 */    'green'            : new JsColor(0x008000), /*  52 */
    'greenyellow'         : new JsColor(0xADFF2F), /*  53 */    'honeydew'         : new JsColor(0xF0FFF0), /*  54 */
    'hotpink'             : new JsColor(0xFF69B4), /*  55 */    'indianred'        : new JsColor(0xCD5C5C), /*  56 */
    'indigo'              : new JsColor(0x4B0082), /*  57 */    'ivory'            : new JsColor(0xFFFFF0), /*  58 */
    'khaki'               : new JsColor(0xF0E68C), /*  59 */    'lavender'         : new JsColor(0xE6E6FA), /*  60 */
    'lavenderblush'       : new JsColor(0xFFF0F5), /*  61 */    'lawngreen'        : new JsColor(0x7CFC00), /*  62 */
    'lemonchiffon'        : new JsColor(0xFFFACD), /*  63 */    'lightblue'        : new JsColor(0xADD8E6), /*  64 */
    'lightcoral'          : new JsColor(0xF08080), /*  65 */    'lightcyan'        : new JsColor(0xE0FFFF), /*  66 */
    'lightgoldenrodyellow': new JsColor(0xfafad2), /*  67 */    'lightgray'        : new JsColor(0xD3D3D3), /*  68 */
    'lightgreen'          : new JsColor(0x90EE90), /*  69 */    'lightpink'        : new JsColor(0xFFB6C1), /*  70 */
    'lightsalmon'         : new JsColor(0xFFA07A), /*  71 */    'lightseagreen'    : new JsColor(0x20B2AA), /*  72 */
    'lightskyblue'        : new JsColor(0x87CEFA), /*  73 */    'lightslategray'   : new JsColor(0x778899), /*  74 */
    'lightsteelblue'      : new JsColor(0xB0C4DE), /*  75 */    'lightyellow'      : new JsColor(0xFFFFE0), /*  76 */
    'lime'                : new JsColor(0x00FF00), /*  77 */    'limegreen'        : new JsColor(0x32CD32), /*  78 */
    'linen'               : new JsColor(0xFAF0E6), /*  79 */    'magenta'          : new JsColor(0xFF00FF), /*  80 */
    'maroon'              : new JsColor(0x800000), /*  81 */    'mediumaquamarine' : new JsColor(0x66CDAA), /*  82 */
    'mediumblue'          : new JsColor(0x0000CD), /*  83 */    'mediumorchid'     : new JsColor(0xBA55D3), /*  84 */
    'mediumpurple'        : new JsColor(0x9370DB), /*  85 */    'mediumseagreen'   : new JsColor(0x3CB371), /*  86 */
    'mediumslateblue'     : new JsColor(0x7B68EE), /*  87 */    'mediumspringgreen': new JsColor(0x00fa9a), /*  88 */
    'mediumturquoise'     : new JsColor(0x48D1CC), /*  89 */    'mediumvioletred'  : new JsColor(0xC71585), /*  90 */
    'midnightblue'        : new JsColor(0x191970), /*  91 */    'mintcream'        : new JsColor(0xF5FFFA), /*  92 */
    'mistyrose'           : new JsColor(0xFFE4E1), /*  93 */    'moccasin'         : new JsColor(0xFFE4B5), /*  94 */
    'navajowhite'         : new JsColor(0xFFDEAD), /*  95 */    'navy'             : new JsColor(0x000080), /*  96 */
    'oldlace'             : new JsColor(0xFDF5E6), /*  97 */    'olive'            : new JsColor(0x808000), /*  98 */
    'olivedrab'           : new JsColor(0x6B8E23), /*  99 */    'orange'           : new JsColor(0xFFA500), /* 100 */
    'orangered'           : new JsColor(0xFF4500), /* 101 */    'orchid'           : new JsColor(0xDA70D6), /* 102 */
    'palegoldenrod'       : new JsColor(0xEEE8AA), /* 103 */    'palegreen'        : new JsColor(0x98FB98), /* 104 */
    'paleturquoise'       : new JsColor(0xAFEEEE), /* 105 */    'palevioletred'    : new JsColor(0xDB7093), /* 106 */
    'papayawhip'          : new JsColor(0xFFEFD5), /* 107 */    'peachpuff'        : new JsColor(0xFFDAB9), /* 108 */
    'peru'                : new JsColor(0xCD853F), /* 109 */    'pink'             : new JsColor(0xFFC0CB), /* 110 */
    'plum'                : new JsColor(0xDDA0DD), /* 111 */    'powderblue'       : new JsColor(0xB0E0E6), /* 112 */
    'purple'              : new JsColor(0x800080), /* 113 */    'red'              : new JsColor(0xFF0000), /* 114 */
    'rosybrown'           : new JsColor(0xBC8F8F), /* 115 */    'royalblue'        : new JsColor(0x4169E1), /* 116 */
    'saddlebrown'         : new JsColor(0x8B4513), /* 117 */    'salmon'           : new JsColor(0xFA8072), /* 118 */
    'sandybrown'          : new JsColor(0xF4A460), /* 119 */    'seagreen'         : new JsColor(0x2E8B57), /* 120 */
    'seashell'            : new JsColor(0xFFF5EE), /* 121 */    'sienna'           : new JsColor(0xA0522D), /* 122 */
    'silver'              : new JsColor(0xC0C0C0), /* 123 */    'skyblue'          : new JsColor(0x87CEEB), /* 124 */
    'slateblue'           : new JsColor(0x6A5ACD), /* 125 */    'slategray'        : new JsColor(0x708090), /* 126 */
    'snow'                : new JsColor(0xFFFAFA), /* 127 */    'springgreen'      : new JsColor(0x00FF7F), /* 128 */
    'steelblue'           : new JsColor(0x4682B4), /* 129 */    'tan'              : new JsColor(0xD2B48C), /* 130 */
    'teal'                : new JsColor(0x008080), /* 131 */    'thistle'          : new JsColor(0xD8BFD8), /* 132 */
    'tomato'              : new JsColor(0xFF6347), /* 133 */    'turquoise'        : new JsColor(0x40E0D0), /* 134 */
    'violet'              : new JsColor(0xEE82EE), /* 135 */    'wheat'            : new JsColor(0xF5DEB3), /* 136 */
  /*'white'               : new JsColor(0xFFFFFF), /* 137 */    'whitesmoke'       : new JsColor(0xF5F5F5), /* 138 */
    'yellow'              : new JsColor(0xFFFF00), /* 139 */    'yellowgreen'      : new JsColor(0x9ACD32), /* 140 */
}; // JsColor.colors = {...};

/**
 * Method: Parse parameters into JsColor
 */
JsColor.parseColor = function(para1, para2, para3, para4) {
  return new JsColor(para1, para2, para3, para4);
}; // JsColor.parseColor = function(para1, para2, para3, para4) {...};
