VanadiumCustomValidationTypes = function() {
  return [
    ['date_au', function(v) {
      if (Vanadium.validators_types['is_empty'].test(v)) return true;
      var regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (!regex.test(v)) return false;
      var d = new Date(v.replace(regex, '$2/$1/$3'));
      return ( parseInt(RegExp.$2, 10) == (1 + d.getMonth()) ) && (parseInt(RegExp.$1, 10) == d.getDate()) && (parseInt(RegExp.$3, 10) == d.getFullYear() );
    }, 'Please use this date format: dd/mm/yyyy. For example 17/03/2006 for the 17th of March, 2006.']
  ]
};