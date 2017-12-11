"use strict";
/*after loading document do event handlers  */
$(document).ready(function() {
 
 	$('.timepicker').timepicker({
    timeFormat: 'HH:mm',
    interval: 60,
    minTime: '09',
    maxTime: '20:00',
    defaultTime: '11',
    startTime: '09:00',
    dynamic: false,
    dropdown: true,
    scrollbar: true
});



$(".datepicker").datepicker({
		inline: true,
		format: 'mm/dd/yyyy',
		startDate: '-1d',
		minDate: 0,
		todayHighlight: true,
        autoclose: true,
	});


	
ToggleAddControls();
$('#btnNewAppointment').toggle();
$('.errors-container').hide();


$('#btnNewAppointment').click(function() {
	
$('.errors-container').hide();	 
ToggleAddControls();

	  
});


$('#btnAddAppointment').click(function() {
	
	
 
 
	 
let desc=$(".input-dsc").val();
 let pdata = "desc=" + desc;

	let timeIn=$(".timepicker").val();
	
	
	let dateTime = new Date($("#datepicker").datepicker("getDate"));

let strDateTime = (dateTime.getMonth()+1) + "/" + dateTime.getDate() + "/" + dateTime.getFullYear();
let dateIn=strDateTime;


let dateStr = dateIn + ' ' + timeIn + ":00";
	
	
	 
  /*Check parsed date*/
  if(isNaN(dateIn) || isNaN(timeIn) || (desc=='')) { 
   $('.errors-container').show();
	
   $('.errors-container').html('Invalid Date /time.');
   
	


  } 

  dateStr = new Date(dateStr);

  
  
   let   dts = dateStr.toISOString();
   

    pdata = encodeURI(pdata + `&date_time=${dts}`);
  

  $.post('./BE.pl', pdata).then(() => {
    //Rerender search results
    PerlCgiGetAppointments($('#search-input').val()).then((data) => {
      AddAppointments(data);
    });

   
    $('#appt-form').trigger('reset');
	  
	
  });
  
ToggleAddControls();
$('.errors-container').hide();	

 
  
});


$('#btnCancel').click(function() {
	$('.errors-container').hide();
ToggleAddControls();

});



$('#search-submit').click(function() {
  let searchText = $('#search-input').val();

  PerlCgiGetAppointments(searchText).then((data) => {
    AddAppointments(data);
  })
  
  .catch((data) => {
    console.log("Error while fetching search results.");
    AddAppointments(data);
  });

});



  PerlCgiGetAppointments().then((data) => {
	  
	
    AddAppointments(data);
  })
  
  
  .catch((data) => {
    AddAppointments(data);
  });
});

/*switch between Add and new buttons */
function ToggleAddControls()
{

$('#appt-form').toggle();
$('#datepicker').toggle();
$('#desc').toggle();
$('#time').toggle();

$('#desc').val(' ');
$('#time').val(' ');
$('#datepicker').val(' ');

$('#btnCancel').toggle();
$('#btnAddAppointment').toggle();
$('#btnNewAppointment').toggle();	
}




/*get Json appointments */
function PerlCgiGetAppointments(searchText="") {
  return new Promise(function(resolve, reject) {

  
    $.getJSON(`./BE.pl?q=${searchText}`, (resp) => {
      if(resp.data) resolve(resp);
    })

    .fail((resp) => { reject(resp) });
  });
}

/*Add appointments to table*/
function AddAppointments(JSONData) {
  

 
 let err= [];
  if(JSONData.errors) {
    for(var i = 0; i < JSONData.errors.length; i++)
      err.push(`<p class="error-msg">${respJSON.errors[i]}</p>`);

    $('.errors-container')[0].html(err.join(''));
  }
  
  if(JSONData.data) {
    let data = JSONData.data;

	let AppRows = [];
	
    for(var i = 0; i < data.length; i++) {
        let dateTime = new Date(data[i]['date_time']);
        AppRows.push(`
        <tr>
          <td>${dateTime.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric' })}</td>
          <td>${('0' + dateTime.getHours()).slice(-2) + ':' + ('0' + dateTime.getMinutes()).slice(-2)}</td>
          <td>${data[i]['description']}</td>
        </tr>
        `);
      }

    $('#tblappts > tbody').html(AppRows.join(''));
  }

  
 
}