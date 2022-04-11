// creates a variable to hold db connections
let db;
// opens connection to IndexedDB called 'new_budget_tracker' and set version to 1
const request = indexedDB.open('new_budget_tracker', 1);

// if the database version changes => 
request.onupgradeneeded = function(event) {
    // reference to the database is saved
    const db = event.target.result;

    db.createObjectStore('store_new_object', { autoIncrement: true });
  };

// upon a successful request render 
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
      render();
    }
  };
  
  //if error log the response 
  request.onerror = function(event) {
    console.log(event.target.errorCode);
  };


function saveRecord(record) {
    // open a new record with db using permissions from read and write
    const transaction = db.transaction(['store_new_object'], 'readwrite');
  
    const trackerObjectStore = transaction.objectStore('store_new_object');

    // add record to store using the add method.
    trackerObjectStore.add(record);
  }


  function render() {
    // open a record thats pending in your db
    const transaction = db.transaction(['store_new_object'], 'readwrite');
  
    // access  pending object
    const trackerObjectStore = transaction.objectStore('store_new_object');
  
    // get all records from store and set to a variable
    const getAll = trackerObjectStore.getAll();

  
    getAll.onsuccess = function() {
      // if there's data in indexedDb's store, send it to the server
      if (getAll.result.length > 0) {
        fetch('/api/record/bulk', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          }
        })
          .then(response => response.json())
          .then(serverResponse => {
            if (serverResponse.message) {
              console.log(serverResponse);
              throw new Error(serverResponse);
            }
  
            const transaction = db.transaction(['store_new_object'], 'readwrite');
            const trackerObjectStore = transaction.objectStore('store_new_object');
            // clear all items in store
            trackerObjectStore.clear();
          })
          .catch(err => {
            // set reference to redirect back here
            console.log(err);
          });
      }
    };
  }
  
  // listen for app coming back online
  window.addEventListener('online', render);
