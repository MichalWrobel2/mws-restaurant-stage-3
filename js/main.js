let restaurants,neighborhoods,cuisines;var map,markers=[];getStaticMapImage=()=>{fetch('http://localhost:1337/restaurants').then((response)=>{return response.json()}).then((restaurants)=>{const loc={lat:40.722216,lng:-73.987501};console.log(restaurants)
let mapURL=`https://maps.googleapis.com/maps/api/staticmap?center=${loc.lat},${loc.lng}&zoom=12&size=${document.documentElement.clientWidth}x400&markers=color:red`;restaurants.forEach(restaurant=>{mapURL+=`|${restaurant.latlng.lat},${restaurant.latlng.lng}`});mapURL+="&key=AIzaSyD9HHo6A99kadjeKZuLopk9F6m1HjKtMhg";console.log(mapURL);document.getElementById('map').style.backgroundImage=`url(${mapURL})`})}
getStaticMapImage();fetch('http://localhost:1337/reviews').then((reviews)=>{return reviews.json()}).then((parsedReviews)=>{DBHelper.idbSave(parsedReviews,'reviews');return parsedReviews})
fetchNeighborhoods=()=>{DBHelper.fetchNeighborhoods((a,b)=>{a?console.error(a):(self.neighborhoods=b,fillNeighborhoodsHTML())})},fillNeighborhoodsHTML=(a=self.neighborhoods)=>{if(a){const b=document.getElementById('neighborhoods-select');a.forEach(c=>{const d=document.createElement('option');d.innerHTML=c,d.value=c,b.append(d)})}},fetchCuisines=()=>{DBHelper.fetchCuisines((a,b)=>{a?console.error(a):(self.cuisines=b,fillCuisinesHTML())})},fetchNeighborhoods(),fetchCuisines()
fillCuisinesHTML=(a=self.cuisines)=>{const b=document.getElementById('cuisines-select');a.forEach(c=>{const d=document.createElement('option');d.innerHTML=c,d.value=c,b.append(d)})},window.initMap=()=>{document.getElementById('neighborhoods-select').addEventListener('click',()=>{removeMapStaticBg()}),document.getElementById('map').addEventListener('click',()=>{removeMapStaticBg()})},removeMapStaticBg=()=>{const a=document.getElementById('map');if('none'!==a.style.backgroundImage){self.map=new google.maps.Map(document.getElementById('map'),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),a.style.backgroundImage='none',addMarkersToMap()}},updateRestaurants=()=>{const a=document.getElementById('cuisines-select'),b=document.getElementById('neighborhoods-select'),c=a.selectedIndex,d=b.selectedIndex,e=a[c].value,f=b[d].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(e,f,(g,h)=>{g?console.error(g):(resetRestaurants(h),fillRestaurantsHTML())})},updateRestaurants(),resetRestaurants=a=>{self.restaurants=[];const b=document.getElementById('restaurants-list');b.innerHTML='',self.markers.forEach(c=>c.setMap(null)),self.markers=[],self.restaurants=a},fillRestaurantsHTML=(a=self.restaurants)=>{const b=document.getElementById('restaurants-list');a.forEach(c=>{b.append(createRestaurantHTML(c))}),addMarkersToMap()
addFavouriteRestaurant()},createRestaurantHTML=a=>{const b=document.createElement('li'),c=document.createElement('img');c.className='restaurant-img lazyload',c.src='img/loading_spinner.gif',c.dataset.src=2===a.id?'img/2.jpg':DBHelper.imageUrlForRestaurant(a),c.alt=`Image of ${a.name} Restaurant`,b.append(c);const d=document.createElement('h2');d.innerHTML=a.name,b.append(d);const e=document.createElement('p');e.innerHTML=a.neighborhood,b.append(e);const f=document.createElement('p');f.innerHTML=a.address,b.append(f);const g=document.createElement('a');const specialLabel=document.createElement('label');const favouritesToggle=document.createElement('div');favouritesToggle.className='rating-star'
favouritesToggle.id=a.id;favouritesToggle.innerHTML='&#9733;';favouritesToggle.setAttribute('aria-label','Mark restaurant as favourite');favouritesToggle.setAttribute('role','button');favouritesToggle.style.color=a.is_favorite?'#ffd700':'#e4e4e4';specialLabel.for=a.id;specialLabel.innerHTML='Mark restaurant as favourite';specialLabel.style.display='none';b.append(favouritesToggle);b.append(specialLabel);return g.innerHTML='View Details',g.href=DBHelper.urlForRestaurant(a),b.append(g),b},addFavouriteRestaurant=()=>{const starNodes=document.getElementsByClassName('rating-star');for(let i=0;i<starNodes.length;i++){starNodes[i].addEventListener('click',(event)=>{writeFavouriteRestaurantToCookies(event.target)})}}
isRestaurantInCookies=(name)=>{return decodeURIComponent(document.cookie).indexOf(name)!==-1},writeFavouriteRestaurantToCookies=(name)=>{if(name.style.color==='rgb(228, 228, 228)'){fetch(`http://localhost:1337/restaurants/${name.id}`,{method:'PUT',body:JSON.stringify({"is_favorite":!0})}).then((response)=>{if(response.status==200){name.style.color='#ffd700';DBHelper.idbUpdateField(name.id,'is_favorite',!0);console.log('UPDATE ENDED WITH SUCCESS')}else{console.log('STATUS DIFFERS FROM 200')}})}else{fetch(`http://localhost:1337/restaurants/${name.id}`,{method:'PUT',body:JSON.stringify({"is_favorite":!1})}).then((response)=>{if(response.status==200){name.style.color='#e4e4e4';DBHelper.idbUpdateField(name.id,'is_favorite',!1);console.log('UPDATE ENDED WITH SUCCESS')}else{console.log('STATUS DIFFERS FROM 200')}})}},generateHash=()=>{var text="";var possible="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(var i=0;i<5;i++)
text+=possible.charAt(Math.floor(Math.random()*possible.length));return text}
addMarkersToMap=(a=self.restaurants)=>{a.forEach(b=>{const c=DBHelper.mapMarkerForRestaurant(b,self.map);google.maps.event.addListener(c,'click',()=>{window.location.href=c.url}),self.markers.push(c)})},navigator.serviceWorker&&navigator.serviceWorker.register('sw.js').then(()=>{})