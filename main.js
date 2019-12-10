
//client 
//DH14IJAUKM1BYP30NFLCOAJAWC0RM05GUT3P25O2P03OWZXB
//secret
//ENKB1IYJGRKXJKZBBCXMD423RZYMXNX0MZLTGMREHCF45VFY


const $loginButton = $("#login");
const $searchButton = $("#search");
const $venuesList = $("#venuesList");
const $venuesHistory = $("#venuesHistory")
const urlSearch = 'https://api.foursquare.com/v2/venues/explore?';
const urlFind  = 'https://api.foursquare.com/v2/venues/';
const key = 'client_id=DH14IJAUKM1BYP30NFLCOAJAWC0RM05GUT3P25O2P03OWZXB&client_secret=ENKB1IYJGRKXJKZBBCXMD423RZYMXNX0MZLTGMREHCF45VFY'
const inputValues=['price','near', 'section'];
var database = firebase.database();
var cities;
var offset = 0;
var sortByPopularity =1;
var v= 20191201;
var limit = 10
var userId ;
var upHistoryList =[];

function ImportDataList(){
    //change late... different file
return {
 "cities":[
{"city" : "Riyadh"},
{"city" : "Jeddah"},
{"city" : "khobar"}
 ] ,
 "sections":[
     {"section": "food"},
     {"section": "drinks"},
     {"section": "coffee"},
     {"section": "art"}
 ],
 "prices":[
     {"price": "1"},
     {"price": "2"},
     {"price": "3"},
     {"price": "4"}
 ]
}

}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      let user = firebase.auth().currentUser;
      if (user) {   
            userId = user.uid
            LoadHistory(userId)
        // User is signed in.
      } else {
        // No user is signed in.
      }
      // ...
    } 
  });

function Logout(){
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
     userId = null;
  }).catch(function(error) {
    // An error happened.
  });
}

function Login(){
    email = $('#email').val();
    password = $('#password').val();
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorMessage = error.message;
        alert('Error: '+errorMessage )
        // ...
      });
}

$(document).ready(function() {
    data = ImportDataList()
   if ('refresh' == SelectOptions('section' , data ,"sections" ,'section') ){
         alert('refresh the page')
   }
   if ('refresh' == SelectOptions('price' , data ,"prices" ,'price') ){
    alert('refresh the page')
}

})

$loginButton.click(function(){  
    Login();
});

$searchButton.click(function (){
        
        GetListData( urlSearch , Query( InitializeSearch() ) ,'search');
});

function SelectOptions(optionElemnts ,data ,lookup,value){
    
let $selectOption =inputValues.findIndex(function(element){
        return element == optionElemnts
});
    if($selectOption == -1 || data == undefined ){
     return 'refresh';
    }
     InitializeSelectOptions(inputValues[$selectOption],data , lookup,value)
}

function InitializeSelectOptions($selectOption, data , lookup , value){  
    for(let key of data[lookup]){
    $('#'+$selectOption).append(new Option(key[value]))
    }
}

function InitializeSearch(){

    let searchList ={
          limit : limit,
          sortByPopularity :sortByPopularity,
          v : v,
          offset: offset
    };
        for(let i=0; i < inputValues.length ;i++){
           if( $('#'+inputValues[i]).val() != ''){
                    searchList[`${inputValues[i]}`] =  $(`#${inputValues[i]}`).val();             
           }
        }
      return searchList;  
}

function Query(list){
        let query=''
         for(let key in list){
            query += `&${key}=${list[key]}`
         }
        
    return query
}


function  GetListData(url,query, type){
        
    $.getJSON(url+key+query ,function(res){
}).done(function(resJson){

    if(type == 'search'){
         offset +=10
        HandleSearchDataList(resJson) 
    }else if(type == 'find'){
         callBackHistory(resJson)
       }

}).fail(function(e){
    alert("somthing went wrong: "+e)}
); 

}

function SaveHistory(){
       if((userId != null || userId != undefined ) && upHistoryList.length >0){
        firebase.database().ref('users/' + userId +'/history').set(
            upHistoryList
        );
       }
}

function LoadHistory(userId){
     let dbRefObject = database.ref().child('users/' + userId + '/history'); 
      dbRefObject.on('value', snap=> HandleHistoryDataList(snap.val()) );
}

function callBackHistory(item){
    DisplayHistory(item)
}

function HandleHistoryDataList(res){
      let i=0;
       for(item of res){
         GetListData(urlFind+item+'?' , Query({v:v}) ,  'find') 
         i++;
         if(i==10) break;
        }
} 

function HandleSearchDataList(res){

    for(item of res.response.groups[0].items) { 
              upHistoryList.push(item.venue.id)
              Display(item);
        //display data on screen
       }
      SaveHistory();    
}

function DisplayHistory(item){
       $venuesHistory.append( CreateListItem(item.response.venue.name , item.response.venue.location.address) )
}

function Display(item){
        $venuesList.append( CreateListItem(item.venue.name , item.venue.location.address) )
}

function CreateListItem(name,address){
    //html
    let a= $('<a>').html(name);
    let p= $("<p>").html(address);
    let li= $("<li>");
    li.append(a)
    li.append(p)
 return li;
}