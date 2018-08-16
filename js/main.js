
let restaurants, neighborhoods, cuisines;
var map, markers = [];

fetch('http://localhost:1337/reviews').then((reviews) => {
    return reviews.json();
  }).then((parsedReviews) => {
   DBHelper.idbSave(parsedReviews, 'reviews');
    return parsedReviews;
})
fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((a, b) => {
        a ? console.error(a) : (self.neighborhoods = b, fillNeighborhoodsHTML())
    })
},
fillNeighborhoodsHTML = (a = self.neighborhoods) => {
    if (a) {
        const b = document.getElementById('neighborhoods-select');
        a.forEach(c => {
            const d = document.createElement('option');
            d.innerHTML = c, d.value = c, b.append(d)
        })
    }
},
fetchCuisines = () => {
    DBHelper.fetchCuisines((a, b) => {
        a ? console.error(a) : (self.cuisines = b, fillCuisinesHTML())
    })
},
fetchNeighborhoods(), fetchCuisines()
fillCuisinesHTML = (a = self.cuisines) => {
    const b = document.getElementById('cuisines-select');
    a.forEach(c => {
        const d = document.createElement('option');
        d.innerHTML = c, d.value = c, b.append(d)
    })
},
window.initMap = () => {
    document.getElementById('neighborhoods-select').addEventListener('click', () => {
        removeMapStaticBg();
    }), document.getElementById('map').addEventListener('click', () => {
        removeMapStaticBg()
    })
},
removeMapStaticBg = () => {
    const a = document.getElementById('map');
    if ('none' !== a.style.backgroundImage) {
        self.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: {
                lat: 40.722216,
                lng: -73.987501
            },
            scrollwheel: !1
        }), a.style.backgroundImage = 'none', addMarkersToMap()
    }
},
updateRestaurants = () => {
    const a = document.getElementById('cuisines-select'),
        b = document.getElementById('neighborhoods-select'),
        c = a.selectedIndex,
        d = b.selectedIndex,
        e = a[c].value,
        f = b[d].value;
    DBHelper.fetchRestaurantByCuisineAndNeighborhood(e, f, (g, h) => {
        g ? console.error(g) : (resetRestaurants(h), fillRestaurantsHTML())
    })
},
updateRestaurants(), resetRestaurants = a => {
    self.restaurants = [];
    const b = document.getElementById('restaurants-list');
    b.innerHTML = '', self.markers.forEach(c => c.setMap(null)), self.markers = [], self.restaurants = a
},
fillRestaurantsHTML = (a = self.restaurants) => {
    const b = document.getElementById('restaurants-list');
    a.forEach(c => {
        b.append(createRestaurantHTML(c))
    }), addMarkersToMap()
    // JUST BIND THE STAR BUTTON
    addFavouriteRestaurant();
},
createRestaurantHTML = a => {
    const b = document.createElement('li'),
        c = document.createElement('img');
    c.className = 'restaurant-img lazyload', c.src = 'img/loading_spinner.gif', c.dataset.src = 2 === a.id ? 'img/2.jpg' : DBHelper.imageUrlForRestaurant(a), c.alt = `Image of ${a.name} Restaurant`, b.append(c);
    const d = document.createElement('h2');
    d.innerHTML = a.name, b.append(d);
    const e = document.createElement('p');
    e.innerHTML = a.neighborhood, b.append(e);
    const f = document.createElement('p');
    f.innerHTML = a.address, b.append(f);
    const g = document.createElement('a');
    const favouritesToggle = document.createElement('div');
    favouritesToggle.className = 'rating-star'
    favouritesToggle.id = a.name;
    favouritesToggle.innerHTML = '&#9733;';
    favouritesToggle.style.color = isRestaurantInCookies(a.name) ? '#ffd700' : '#e4e4e4';
    b.append(favouritesToggle);

    return g.innerHTML = 'View Details', g.href = DBHelper.urlForRestaurant(a), b.append(g), b
},
addFavouriteRestaurant = () => {
	const starNodes = document.getElementsByClassName('rating-star');
	for(let i = 0; i < starNodes.length; i++) {
		starNodes[i].addEventListener('click', (event) => {
			writeFavouriteRestaurantToCookies(event.target.id);
			if (event.target.style.color === 'rgb(228, 228, 228)') {
				event.target.style.color = '#ffd700';
			} else {
				event.target.style.color = '#e4e4e4';
			}
		});
	}
}
isRestaurantInCookies = (name) => {
	return decodeURIComponent(document.cookie).indexOf(name) !== -1;
},
writeFavouriteRestaurantToCookies = (name) => {
	const cookieValues = decodeURIComponent(document.cookie);
	if (cookieValues.indexOf(name) !== -1) {
		//Remove cookie - restaurant is no longer favourite
		cookieValues.split(';').forEach((cookie) => {
			if (cookie.indexOf(name) !== -1) {
				document.cookie = cookie +'=; path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			}
		})
		return;
	}

	const d = new Date();
    const exdays = 365;
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    const expires = "expires="+ d.toUTCString();
    document.cookie = `fav-restaurant-${generateHash()}=${name};${expires};path=/;`;
},
generateHash = () => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
addMarkersToMap = (a = self.restaurants) => {
    a.forEach(b => {
        const c = DBHelper.mapMarkerForRestaurant(b, self.map);
        google.maps.event.addListener(c, 'click', () => {
            window.location.href = c.url
        }), self.markers.push(c)
    })
}, navigator.serviceWorker && navigator.serviceWorker.register('sw.js').then(() => {});

