
// Sorting Currency Columns
jQuery.fn.dataTableExt.aTypes.unshift(
    function ( sData )
    {
        var sValidChars = "0123456789.-,";
        var Char;

        /* Check the numeric part */
        for ( i=1 ; i<sData.length ; i++ )
        {
            Char = sData.charAt(i);
            if (sValidChars.indexOf(Char) == -1)
            {
                return null;
            }
        }

        /* Check prefixed by currency */
        if ( sData.charAt(0) == '$' || sData.charAt(0) == '£' )
        {
            return 'currency';
        }
        return null;
    }
);

jQuery.fn.dataTableExt.oSort['currency-asc'] = function(a,b) {
    /* Remove any formatting */
    var x = a == "-" ? 0 : a.replace( /[^\d\-\.]/g, "" );
    var y = b == "-" ? 0 : b.replace( /[^\d\-\.]/g, "" );

    /* Parse and return */
    x = parseFloat( x );
    y = parseFloat( y );
    return x - y;
};

jQuery.fn.dataTableExt.oSort['currency-desc'] = function(a,b) {
    var x = a == "-" ? 0 : a.replace( /[^\d\-\.]/g, "" );
    var y = b == "-" ? 0 : b.replace( /[^\d\-\.]/g, "" );

    x = parseFloat( x );
    y = parseFloat( y );
    return y - x;
};

// Sorting Formatted Numbers
jQuery.fn.dataTableExt.aTypes.unshift(
    function ( sData )
    {
        var deformatted = sData.replace(/[^\d\-\.\/a-zA-Z]/g,'');
        if ( $.isNumeric( deformatted ) ) {
            return 'formatted-num';
        }
        return null;
    }
);

jQuery.fn.dataTableExt.oSort['formatted-num-asc'] = function(a,b) {
    /* Remove any formatting */
    var x = a.match(/\d/) ? a.replace( /[^\d\-\.]/g, "" ) : 0;
    var y = b.match(/\d/) ? b.replace( /[^\d\-\.]/g, "" ) : 0;

    /* Parse and return */
    return parseFloat(x) - parseFloat(y);
};

jQuery.fn.dataTableExt.oSort['formatted-num-desc'] = function(a,b) {
    var x = a.match(/\d/) ? a.replace( /[^\d\-\.]/g, "" ) : 0;
    var y = b.match(/\d/) ? b.replace( /[^\d\-\.]/g, "" ) : 0;

    return parseFloat(y) - parseFloat(x);
};

/* Default class modification */
$.extend( $.fn.dataTableExt.oStdClasses, {
  "sWrapper": "dataTables_wrapper form-inline"
} );

/* API method to get paging information */
$.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings )
{
  return {
    "iStart":         oSettings._iDisplayStart,
    "iEnd":           oSettings.fnDisplayEnd(),
    "iLength":        oSettings._iDisplayLength,
    "iTotal":         oSettings.fnRecordsTotal(),
    "iFilteredTotal": oSettings.fnRecordsDisplay(),
    "iPage":          Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
    "iTotalPages":    Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
  };
}

/* Bootstrap style pagination control */
$.extend( $.fn.dataTableExt.oPagination, {
  "bootstrap": {
    "fnInit": function( oSettings, nPaging, fnDraw ) {
      var oLang = oSettings.oLanguage.oPaginate;
      var fnClickHandler = function ( e ) {
        e.preventDefault();
        if ( oSettings.oApi._fnPageChange(oSettings, e.data.action) ) {
          fnDraw( oSettings );
        }
      };

      $(nPaging).addClass('pagination').append(
        '<ul class="pagination">'+
          '<li class="prev disabled"><a href="#">&laquo; '+oLang.sPrevious+'</a></li>'+
          '<li class="next disabled"><a href="#">'+oLang.sNext+' &raquo; </a></li>'+
        '</ul>'
      );
      var els = $('a', nPaging);
      $(els[0]).bind( 'click.DT', { action: "previous" }, fnClickHandler );
      $(els[1]).bind( 'click.DT', { action: "next" }, fnClickHandler );
    },

    "fnUpdate": function ( oSettings, fnDraw ) {
      var iListLength = 5;
      var oPaging = oSettings.oInstance.fnPagingInfo();
      var an = oSettings.aanFeatures.p;
      var i, j, sClass, iStart, iEnd, iHalf=Math.floor(iListLength/2);

      if ( oPaging.iTotalPages < iListLength) {
        iStart = 1;
        iEnd = oPaging.iTotalPages;
      }
      else if ( oPaging.iPage <= iHalf ) {
        iStart = 1;
        iEnd = iListLength;
      } else if ( oPaging.iPage >= (oPaging.iTotalPages-iHalf) ) {
        iStart = oPaging.iTotalPages - iListLength + 1;
        iEnd = oPaging.iTotalPages;
      } else {
        iStart = oPaging.iPage - iHalf + 1;
        iEnd = iStart + iListLength - 1;
      }

      for ( i=0, iLen=an.length ; i < iLen ; i++ ) {
        // Remove the middle elements
        $('li:gt(0)', an[i]).filter(':not(:last)').remove();

        // Add the new list items and their event handlers
        for ( j=iStart ; j<=iEnd ; j++ ) {
          sClass = (j==oPaging.iPage+1) ? 'class="active"' : '';
          $('<li '+sClass+'><a href="#">'+j+'</a></li>')
            .insertBefore( $('li:last', an[i])[0] )
            .bind('click', function (e) {
              e.preventDefault();
              oSettings._iDisplayStart = (parseInt($('a', this).text(),10)-1) * oPaging.iLength;
              fnDraw( oSettings );
            } );
        }

        // Add / remove disabled classes from the static elements
        if ( oPaging.iPage === 0 ) {
          $('li:first', an[i]).addClass('disabled');
        } else {
          $('li:first', an[i]).removeClass('disabled');
        }

        if ( oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0 ) {
          $('li:last', an[i]).addClass('disabled');
        } else {
          $('li:last', an[i]).removeClass('disabled');
        }
      }
    }
  }
} );