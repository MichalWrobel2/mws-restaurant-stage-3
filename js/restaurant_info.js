let restaurant;
var map;
const fullInfo = {};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
 isRestaurantInCookies = (name) => {
  return decodeURIComponent(document.cookie).indexOf(name) !== -1;
}
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `Image of ${restaurant.name} Restaurant`

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  if (isRestaurantInCookies(self.restaurant.name)) {
    const favStar = document.createElement('div')
    favStar.innerHTML = '&#9733;<p id ="fav-description">Favourite</p>';
    document.getElementById('restaurant-cuisine').appendChild(favStar);
  }
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  const id = getParameterByName('id');
  const ul = document.getElementById('reviews-list');
  const form = document.createElement('form');
  form.innerHTML = '<form action=""> <fieldset> <legend>Review restaurant:</legend> Your name:<br><input type="text" name="firstname"><br><span>Rating<br><select name="rating"><option value="1">1</option> <option value="2">2</option> <option value="3">3</option> <option value="4">4</option><option value="5">5</option> </select><span><br>Review:<br><textarea type="text" name="lastname" cols="50" rows="5" value=""></textarea><br><br><input type="submit" value="Add a review"> </fieldset></form>'
  title.innerHTML = 'Reviews';
  container.appendChild(title);
  container.appendChild(form);

  bindFormSubmit();
  getValuesFromForm();
  DBHelper.idbRead('reviews').then((reviews) => {
    if (reviews && reviews.length) {
     reviews.forEach((review) => {
        if (review.restaurant_id == id) {
          ul.appendChild(createReviewHTML(review));
        }
     });
     container.appendChild(ul);
      return;
    } else {
    DBHelper.fetchRestaurantReview(id).then((response) => {
        response.forEach(review => {
         ul.appendChild(createReviewHTML(review));
       });
      container.appendChild(ul);
     if (!container.hasChildNodes()) {
       const noReviews = document.createElement('p');
       noReviews.innerHTML = 'No reviews yet!';
       container.appendChild(noReviews);
        return;
      }
    })
    }

  })

}
bindFormSubmit = () => {
  const form = document.getElementsByTagName('fieldset')[0];
  const formButton = form.getElementsByTagName('input')[1];

  formButton.addEventListener('click', (e) => {
    e.preventDefault();
    postReview();
    return false;
  })
}
getValuesFromForm = () => {
  const form =  document.getElementsByTagName('fieldset')[0],
  inputNode = form.getElementsByTagName('input')[0],
  select = form.getElementsByTagName('select')[0],
  textareaNode = form.getElementsByTagName('textarea')[0];
 inputNode.addEventListener('input', (userInput) => {
    fullInfo.name = userInput.target.value;
  });
  select.addEventListener('change', (userInput) => {
    fullInfo.rating = userInput.currentTarget.value;
  });
  textareaNode.addEventListener('change', userInput => {
    fullInfo.comments = userInput.currentTarget.value;
  })
  return fullInfo;
}
postReview = () => {
  const dataToPost = getValuesFromForm();
  const reviewDate = new Date();
  dataToPost.createdAt = dataToPost.updatedAt = reviewDate.getTime();
  if (!dataToPost.comments || !dataToPost.name) {
    alert('Please fill all form fields first');
    return;
  }
  if (!dataToPost.rating) {
    dataToPost.rating = 1;
  }
  dataToPost.restaurant_id = getParameterByName('id');
  if (!navigator.onLine) {
    sendDataWhenOnline(dataToPost);

    return;
  }

  fetch('http://localhost:1337/reviews', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dataToPost)
  })
 }
sendDataWhenOnline = (dataToPost) => {
  const dataJSON = JSON.stringify(dataToPost);
  localStorage.setItem('pending-review', dataJSON);
  window.addEventListener('online', () => {
     fetch('http://localhost:1337/reviews', {
     method: "POST",
     headers: {
        "Content-Type": "application/json"
     },
     body: dataJSON
    })
  })
  localStorage.removeItem('pending-review');
}
/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {

  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  //format date
  const converedDate = new Date(review.updatedAt);
  date.innerHTML = `${converedDate.getDate()} / ${converedDate.getMonth()} / ${(converedDate.getYear() + 1900)}`
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-label', restaurant.name);
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
