var usersRef = new Firebase('https://uberfavorites.firebaseio.com/users');

var uberUrl = 'https://api.uber.com/v1/products';

var geo;

function retrieveGeo(handler) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            handler([ position.coords.latitude, position.coords.longitude]);
        });
    } else {
        handler(null);
    }
}

var currentDisplay = '#uf-form';

function switchDisplay(display) {
    $(currentDisplay).removeClass('uf-selected');
    $(display).addClass('uf-selected');
    currentDisplay = display;
}

var favorites = {};

function onLogin() {
    getProfile().child('favorites').once('value', function (dataSnap) {
        var data = dataSnap.val();
        favorites = data;
        var selects = $('.uf-favorites-select');
        selects.empty();
        for (var i in favorites) {
            selects.append($('<option>').attr('value', i).text(favorites[i].name));
        }
        switchDisplay('#uf-favorites');
    });
}

function onGeo(position) {
    geo = position;
    console.log($('#uf-add-current-name-label'));
    $('#uf-add-current-name-label').html('Current Location:<br>' + geo[0] + ', ' + geo[1]);
}

function getProfile() {
    return usersRef.child(usersRef.getAuth().uid);
}

function createFavoriteObj(objName, objLat, objLong) {
    return {
        name: objName,
        lat: objLat,
        long: objLong
    }
}

$(document).ready(function () {
    $('#uf-submit').click(function () {
        var emailVal = $('#uf-email').val();
        var passVal = $('#uf-pass').val();

        var userInfo = {
            email: emailVal,
            password: passVal
        };

        usersRef.authWithPassword(userInfo, function (error, authData) {
            if (!error) {
                onLogin();
                return;
            }
            if (error.code == 'INVALID_USER') {
                usersRef.createUser(userInfo, function (error, userData) {
                    if (error) {
                        alert(error.message);
                    } else {
                        usersRef.authWithPassword(userInfo, function (error, authData) {
                            if (error) {
                                alert(error.message);
                            } else {
                                onLogin();
                            }
                        });
                    }
                });
            } else {
                alert(error.message);
            }
        });
    });

    $('#uf-favorites-add').click(function () {
        switchDisplay('#uf-add');
        retrieveGeo(onGeo);
    });

    $('#uf-add-current').click(function () {
        var name = $('#uf-add-current-name').val();
        getProfile().child('favorites').push(createFavoriteObj(name, geo[0], geo[1]), function (error) {
            if (error) {
                alert(error.message);
            } else {
                alert('Added ' + name);
            }
        });
    });

    $('#uf-add-custom').click(function () {
        var name = $('#uf-add-custom-name').val();
        getProfile().child('favorites').push(createFavoriteObj(name, $('#uf-add-custom-latitude').val(), $('#uf-add-custom-longitude').val()), function (error) {
            if (error) {
                alert(error.message);
            } else {
                alert('Added ' + name);
            }
        });
    });

    $('#uf-add-back').click(function () {
        onLogin();
    });

    $('#uf-favorites-request').click(function () {

    });
});
