$(document).ready(function() {
        getStates();

        function getStates() {
            $.ajax({
                url: "https://cdn-api.co-vin.in/api/v2/admin/location/states",
                method: "get",
                contentType: "application/json; charset=utf-8",
                success: function(data) {
                    var states = ''
                    states += '<h5>SELECT STATE</h5>'
                    states += '<div class="form-group">'
                    states += '<select class="form-select states" aria-label="Default select example" onchange="getStateValue(this);">'
                    states += '<option>Choose State</option>'
                    $.each(data.states, function(index, value) {
                        states += '<option value="' + value.state_id + '">' + value.state_name + '</option>'
                    })
                    states += '</select>'
                    states += '</div>'
                    $('.all-states').html(states);
                    $('.states').select2();
                }
            })
        }
    })
function getStateValue(states) {
    var state_id = states.value;
    var districts = ''
    $.ajax({
        url: "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + state_id,
        method: "get",
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            districts += '<h5>SELECT DISTRICT</h5>'
            districts += '<div class="form-group">'
            districts += '<select class="form-select all-districts" onchange="getDistrictValue(this);">'
            districts += '<option>Choose District</option>'
            $.each(data.districts, function(index, value) {
                districts += '<option value="' + value.district_id + '">' + value.district_name + '</option>'
            })
            districts += '</select>'
            districts += '</div>'
            $('.districts').html(districts)
            $('.all-districts').select2()
        }
    })
}
function getDistrictValue(district) {

    var district_id = district.value
    $('.date-picker').remove()
    var date = '<div class="date-picker"><h5>SELECT DATE</h5><input type="date" class="selected-date form-control" name="date" onchange="getSelectedDate(this);"></div>'
    $('.date').append(date)
}
function getSelectedDate(date) {
    var district_id = $('.all-districts').val()
    var date = date.value.split("-").reverse().join("-")
    showHospitals(district_id, date)
}
function showHospitals(district_id, date) {
    var hospitals = ''
    $.ajax({
        url: "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=" + district_id + "&date=" + date + "",
        method: "get",
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            $('html,body').animate({
                scrollTop: $(".hospitals").offset().top
            }, '1000');
            $(this).fadeIn("slow");

            var blocks = [...new Map(data.sessions.map(item => [item['block_name'], item])).values()];
            if (blocks.length > 2) {
                hospitals += '<div class="d-flex blocks justify-content-md-center">'
                hospitals += '<div>'
                hospitals += '<button type="button" class="btn mx-1 btn-outline-primary categories rounded-pill" data-filter="all">All</button></div>'
                $.each(blocks, function(ind, value) {
                    hospitals += '<div>'

                    hospitals += '<button class="btn mx-1 btn-outline-primary categories rounded-pill" data-filter="' + value.block_name.replace(/ /g, "-") + '">' + value.block_name + '</div>'
                })
                hospitals += '</div>'
            }
            hospitals += '<h5>Hospitals available on (' + date + ')</h5>'

            hospitals += '<div class="row">'
            if(data.sessions.length>0){
                $.each(data.sessions, function(index, value) {
                    hospitals += '<div class="col-lg-3 details col-sm-12 p-3 ' + value.block_name.replace(/ /g, "-") + ' ">'
                    hospitals += '<div class="card border-0 ">'
                    hospitals += '<div class="card-header bg-primary text-white text-wrap" data-bs-target="#collapse-' + value.center_id + '">'
                    hospitals += '<i class="fa fa-plus-square fa-2x"></i><span class="h-name mx-2">' +
                        value.name + '</span><i class="fa fa-chevron-down mt-2" ></i></div>'
                    hospitals += '<div class="card-body" id="collapse-' + value.center_id + '">'
                    hospitals += '<p><i class="fas fa-map-marker mx-1"></i>' + value.address + '</p>'
                    hospitals += '<p><i class="fas fa-rupee-sign mx-1"></i>' + value.fee + '</p>'
                    hospitals += '<p><i class="fas fa-syringe mx-1"></i>' + value.vaccine + ' (<b>' + value.available_capacity + '</b>) </p>'
                    hospitals += '<div class="mx-4 mb-1">Dose 1 - <b>' + value.available_capacity_dose1 + '</b></div>'
                    hospitals += '<div class="mx-4 mb-3">Dose 2 - <b>' + value.available_capacity_dose2 + '</b></div>'
                    if (value.max_age_limit == undefined) {
                        value.max_age_limit = ' & above'
                    } else {
                        value.max_age_limit = ' - ' + value.max_age_limit
                    }

                    hospitals += '<p>Age Limit - <span ><b>' + value.min_age_limit + value.max_age_limit + '</b></span></p>'
                    hospitals += '<p><i class="far fa-clock mx-1"></i>Timings</p>'
                    $.each(value.slots, function(ind, availableslots) {
                        hospitals += '<p class="rounded border slots border-primary text-center">' + availableslots.time + '</p>'
                    })


                    hospitals += '</div>'
                    hospitals += '</div>'
                    hospitals += '</div>'

                })
            }else{
                hospitals +='<h4 class="text-center" style="margin-top:10%">Sorry no vaccination providers available in this date</h4>'
            }
            hospitals += '</div>'
            $('.hospitals').html(hospitals)
        }
    })
}
$(document).on('click', ".card", function() {
    $(this).find(".card-body").toggle();
    $('.card-body').click(function() {
        return false;
    });
});
$(document).on('click', '.categories', function() {
        $('.categories').removeClass('active');
        $(this).addClass('active');
        var category = $(this).data('filter');
        $('.details').each(function() {
            if (category == 'all') {
                $(this).fadeIn("slow");
                $(this).show()
            } else {
                $(this).fadeIn("slow");
                $(this).hide().filter('.' + category).show();

            }
        })
    })