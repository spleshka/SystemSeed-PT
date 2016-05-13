(function($) {


  $.ajax( {
    url: 'https://everhour.com/organizations/4169/reports/project/?d=month',
    type: 'get',
    dataType: 'html',
    xhrFields: {
      withCredentials: true
    },
    crossDomain: true,

    success: function (data) {
      $('body').html(data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $('body').html('errorca');
      // $('body').html(errorThrown);
    },
    statusCode: {
      404: function() { $('body').html('404'); },
      403: function() { $('body').html('403'); }
    }
  })



})(jQuery);