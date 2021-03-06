/**
 * The client application code for the Amazon / Library search app:
 * cpl-search.herokuapp.com
 * github.com/dvoiss/amazon-library-search/
 */
$(document).ready(function() {
  // the event source
  var src;

  // restore email from localStorage if available
  var emailStorageKey = "CPL_EMAIL";
  $("#email").val(localStorage.getItem(emailStorageKey));
  var libraryStorageKey = "CPL_LIBRARY";
  $("#library-select").val(localStorage.getItem(libraryStorageKey));

  $("#search-btn").click(function(event) {
    event.preventDefault();

    var email = $('#email').val();
    // quick reg-ex for e-mail validation (not exact at all)
    if (!email || !email.match(/^\S+@\S+.\S+$/))
    {
      showEmailValidation(); 
      return;
    }
    else
      hideEmailValidation();

    // save email in local storage
    localStorage.setItem(emailStorageKey, email);
    localStorage.setItem(libraryStorageKey, $("#library-select").val());

    newSearch();

    var library = $('#library-select :selected').html();
    var libraryCode = $('#library-select').val() || 0;
    var booksRetrieved = false,
        noWishlistFound = false;

    if (src) src.close();
    src = new EventSource('/retrieve/' + email + '/' + libraryCode + '/' + library);
    src.onmessage = function(event) {
      (!event.data) ? handleDataFinished() : handleData(event.data);
    }
    src.onerror = function(event) {
      src.close();
      $('#progress-spinner').hide();
      $('#status').html("An error may have occurred.<div style=\"clear: both\"/><br/>Due to lack of an API, library pages and Amazon pages are scraped and then parsed. A change in the Amazon or library HTML/CSS code could have caused the error.<br/>Contact the author: <a href='http://www.twitter.com/dvoiss' title='author\'s twitter'>@dvoiss</a></div>");
    }

    function handleDataFinished() {
      src.close();
      $('#progress-spinner').hide();
      if (noWishlistFound)
        return;
      else if (!booksRetrieved)
        $('#status').html("No books from your wishlist were found at " + library + ".");
      else
        $('#status').html("Showing books from your wishlist available at " + library + ".");
    }
    
    function handleData(data) {
      if (data.indexOf('status: ') == 0)
      {
        $('#status').html(data.slice(8));
        if (data.indexOf("Cannot find the wishlist") != -1) noWishlistFound = true;
      }
      else
      {
        booksRetrieved = true;
        $(data).hide().appendTo('#list').slideDown();
      }
    }
  });

  $("#back-btn").click(function(event) {
    src.close();

    $('form').show();
    $('#directions').show();

    $('#results-top').hide();
    $('#progress-spinner').hide();
    $('#back-btn').hide();
  });

  function newSearch() {
    $('#status').html("Retrieving wishlist from Amazon");

    $('#list').empty();
    $('form').hide();
    $('#directions').hide();

    $('#results-top').show();
    $('#progress-spinner').show();
    $('#back-btn').show();

    noWishlistFound = false;
  }

  function showEmailValidation() {
      $("#validation").slideDown();
      $("#email").addClass("input-validation");
  }
  function hideEmailValidation() {
      $("#validation").hide();
      $("#email").removeClass("input-validation");
  }
}); 