/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * IndexedDB
   */
  static idbOpen(storeName='restaurants-info') {
   const dbPromise = idb.open(storeName, 1, upgradeDB => {
      upgradeDB.createObjectStore(storeName, {keyPath: 'id', autoIncrement : true}).createIndex('byId', 'id');;
    });

    return dbPromise;
  }

  static idbSave(data, storeName='restaurants-info') {
    return DBHelper.idbOpen(storeName).then((db) => {
      if (!db) return;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      data.forEach((restaurant) => {
        store.put(restaurant);
      });

      return tx.complete;
    });
  }

  static idbUpdateField(id, field, value, storeName='restaurants-info') {
    return DBHelper.idbOpen(storeName).then((db) => {
      if (!db) return;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      store.getAll().then((restaurants) => {
       restaurants.forEach((restaurant) => {
        if (restaurant.id == id) {
         const restaurantData = restaurant;
         restaurantData[field] = value;
         store.put(restaurantData);
         console.log('Updating value in idb');
        }

       });
      });
    });
  }

  static idbRead(storeName='restaurants-info') {

    const read = DBHelper.idbOpen(storeName).then(db => {
      const tx = db.transaction(storeName, 'readwrite');

      return tx.objectStore(storeName).getAll();

    });

    return read;
   }
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */

  static fetchRestaurants() {
    // get all restaurants from cache
    return DBHelper.idbRead().then((restaurants) => {
      if (restaurants.length) {

        return restaurants;
      } else {

        return fetch(DBHelper.DATABASE_URL)
        .then((response) => {
          const parsedResponse = response.json();

          return parsedResponse;
        }).then((restaurants) => {
          DBHelper.idbSave(restaurants);
          return restaurants;
        })
        .catch((error) => console.error(error))
      }

    });

  }
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {

    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants().then((restaurants) => {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants().then((restaurants) => {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      });
    };


  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants().then((restaurants) => {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants().then((restaurants) => {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants().then((restaurants) => {
        // Get all neighborhoods from all restaurants
        if (!restaurants) return;
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants().then((restaurants) => {
      if (!restaurants) return;
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`/restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}.webp`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  static fetchRestaurantReview(id){
    return fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`).then((response) => {

      return response.json();
  });
  }
}
