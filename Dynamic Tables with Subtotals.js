  // CREATE DYNAMIC TABLES WITH OPTIONAL SUBTOTALS ROW.
  function CreateDynamicTable(target, heading, tblid = "", subtotal, XFD, p1Name, p1, p2Name = "ddl2", p2 = 0) {
    
    // REQUEST JSON DATA FROM FEED

    // I uses the jQuery getJSON function to return JSON encoded data from a feed.
    // Seeing my data is from the same origin, this is not an issue for me.
    // You should use whatever method you need, in order to return your JSON data.

    var URL = '{url to your JSON data here}'; // replace curly brackets with url to dynamic data feed

    $.getJSON(URL, {
        "xfd" : XFD,
        "pid" : 0,
        [p1Name] : p1,
        [p2Name] : p2
    }, 

    // ON SUCCESSFULLY GETTING DATA, USE SUCCESS FUNCTION TO DYNAMICALLY CREATE HTML TABLE

    function(myData){

        // Start by determining what the table headings are going to be.
        // Extract the Keys, From Key:Value Pairs in Your JSON Object, for The Html Headers, and Push to an Array. 
        // Example ('Clinic', 'Department', 'Assignment', 'ColumnNameForEachDate')
        var col = [];
        for (var i = 0; i < myData.length; i++) {
            for (var key in myData[i]) {
                if (col.indexOf(key) === -1) {
                    col.push(key);
                }
            }
        }

        // Create the table element then assign it an Id and Class
        var table = document.createElement("table");
        $(table).attr({
          id: tblid,
          class: 'table table-bordered table-striped'
        });

        // Add the table head section element
        var thead = table.createTHead();
        
        // Add the html table header row using the extracted headers array above.
        var tr = thead.insertRow(-1);                   // Insert a row element into the table header.

        for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th");      // Add a th element for each header in the array.
            th.innerHTML = col[i];
            tr.appendChild(th);
        }

        // Add the table body element
        var tbody = table.createTBody();

        // Add JSON data to the table body.
        // Insert a row for each record in the JSON Feed as a tr element
        for (var i = 0; i < myData.length; i++) {       
            tr = tbody.insertRow(-1);

            for (var j = 0; j < col.length; j++) {
                var tabCell = tr.insertCell(-1);
                // Add the "sum" class to all columns after the 3rd column
                // The sum class needs to be set on the columns you want to subtotal in the footer
                if (j > 2) {
                    tabCell.setAttribute('class', 'sum');
                }
                // Populate each cell with data from the curent record
                tabCell.innerHTML = myData[i][col[j]];
            }
        }

        // CREATE/ADD THE TABLE FOOTER ROW (not actually a footer, but the last row in the table body).
        // insert a subtotal row for the table and set the class to subhead if subtotal = true.
        if (subtotal === true) {
          tr = table.insertRow(-1);
          tr.setAttribute('class', 'subhead');

          for (var j = 0; j < col.length; j++) {
              var tabCell = tr.insertCell(-1);

              // Add the heading for the subtotal row.
              if (j == 0) {
                  tabCell.innerHTML="Total Daily Volunteer Counts";
              }

              // Add the subtotal class to all columns after the 3rd column
              if (j > 2) {
                  tabCell.setAttribute('class', 'subtotal');
              }
          }
        }
   
        // ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.    
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(endRequestHandler) 

        function endRequestHandler(sender, args) {
          var divContainer = document.getElementById(target);
          divContainer.innerHTML = "<h4>" + heading + "</h4>";
          divContainer.appendChild(table);
          $('.' + p1Name).val(p1);
          $('.' + p2Name).val(p2);

          // FINALLY RUN THE SCRIPT TO CALCULATE AND POPULATE THE SUBTOTAL ROW
          function tally (selector) {
              $(selector).each(function () {
                  var total = 0,
                      column = $(this).siblings(selector).andSelf().index(this);
                  $(this).parents().prevUntil(':has(' + selector + ')').each(function () {
                      total += parseFloat($('td.sum:eq(' + column + ')', this).html()) || 0;
                  })
                  $(this).html(total);
              });
          }
          tally('td.subtotal');
          tally('td.total');
          
          if(tblid !== undefined && tblid !== null) {
            $('#' + tblid).DataTable();
          }
        }     
    })

    // ON ERROR - RETURN ERROR "No Results Found".
    .error(function() {
       Sys.WebForms.PageRequestManager.getInstance().add_endRequest(endRequestHandler) 
        function endRequestHandler(sender, args) {
        document.getElementById(target).innerHTML = "<h4>" + heading + "</h4><h5 class='resultError'>No Results Found For " + p1 + "</h5>"
        $('.' + p1Name).val(p1);
        $('.' + p2Name).val(p2);
       }   
    }); 
  }  // END CREATEDYNAMICTABLE FUNCTION!
