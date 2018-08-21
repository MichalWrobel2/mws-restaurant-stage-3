class DBHelper{static idbOpen(storeName='restaurants-info'){const dbPromise=idb.open(storeName,1,upgradeDB=>{upgradeDB.createObjectStore(storeName,{keyPath:'id',autoIncrement:!0}).createIndex('byId','id')});return dbPromise}
static idbRemove(data,storeName='restaurants-info'){return DBHelper.idbOpen(storeName).then((db)=>{if(!db)return;const tx=db.transaction(storeName,'readwrite');const store=tx.objectStore(storeName);store.delete(parseInt(data.id))})}
static idbSave(data,storeName='restaurants-info'){return DBHelper.idbOpen(storeName).then((db)=>{if(!db)return;const tx=db.transaction(storeName,'readwrite');const store=tx.objectStore(storeName);data.forEach((restaurant)=>{store.put(restaurant)});return tx.complete})}
static idbUpdateField(id,field,value,storeName='restaurants-info'){return DBHelper.idbOpen(storeName).then((db)=>{if(!db)return;const tx=db.transaction(storeName,'readwrite');const store=tx.objectStore(storeName);store.getAll().then((restaurants)=>{restaurants.forEach((restaurant)=>{if(restaurant.id==id){const restaurantData=restaurant;restaurantData[field]=value;store.put(restaurantData);console.log('Updating value in idb')}})})})}
static idbRead(storeName='restaurants-info'){const read=DBHelper.idbOpen(storeName).then(db=>{const tx=db.transaction(storeName,'readwrite');return tx.objectStore(storeName).getAll()});return read}
static get DATABASE_URL(){const port=1337;return `http://localhost:${port}/restaurants`}
static fetchRestaurants(){return DBHelper.idbRead().then((restaurants)=>{if(restaurants.length){return restaurants}else{return fetch(DBHelper.DATABASE_URL).then((response)=>{const parsedResponse=response.json();return parsedResponse}).then((restaurants)=>{DBHelper.idbSave(restaurants);return restaurants}).catch((error)=>console.error(error))}})}
static fetchRestaurantById(id,callback){DBHelper.fetchRestaurants().then((restaurants)=>{const restaurant=restaurants.find(r=>r.id==id);if(restaurant){callback(null,restaurant)}else{callback('Restaurant does not exist',null)}})}
static fetchRestaurantByCuisine(cuisine,callback){DBHelper.fetchRestaurants().then((restaurants)=>{const results=restaurants.filter(r=>r.cuisine_type==cuisine);callback(null,results)})};static fetchRestaurantByNeighborhood(neighborhood,callback){DBHelper.fetchRestaurants().then((restaurants)=>{const results=restaurants.filter(r=>r.neighborhood==neighborhood);callback(null,results)})}
static fetchRestaurantByCuisineAndNeighborhood(cuisine,neighborhood,callback){DBHelper.fetchRestaurants().then((restaurants)=>{let results=restaurants
if(cuisine!='all'){results=results.filter(r=>r.cuisine_type==cuisine)}
if(neighborhood!='all'){results=results.filter(r=>r.neighborhood==neighborhood)}
callback(null,results)})}
static fetchNeighborhoods(callback){DBHelper.fetchRestaurants().then((restaurants)=>{if(!restaurants)return;const neighborhoods=restaurants.map((v,i)=>restaurants[i].neighborhood)
const uniqueNeighborhoods=neighborhoods.filter((v,i)=>neighborhoods.indexOf(v)==i)
callback(null,uniqueNeighborhoods)})}
static fetchCuisines(callback){DBHelper.fetchRestaurants().then((restaurants)=>{if(!restaurants)return;const cuisines=restaurants.map((v,i)=>restaurants[i].cuisine_type)
const uniqueCuisines=cuisines.filter((v,i)=>cuisines.indexOf(v)==i)
callback(null,uniqueCuisines)})}
static urlForRestaurant(restaurant){return(`/restaurant.html?id=${restaurant.id}`)}
static imageUrlForRestaurant(restaurant){return(`/img/${restaurant.id}.webp`)}
static mapMarkerForRestaurant(restaurant,map){const marker=new google.maps.Marker({position:restaurant.latlng,title:restaurant.name,url:DBHelper.urlForRestaurant(restaurant),map:map,animation:google.maps.Animation.DROP});return marker}
static fetchRestaurantReview(id){return fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`).then((response)=>{return response.json()})}}