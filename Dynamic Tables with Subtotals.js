  // Create Dynamic Tables with optional subtotals row.
  function CreateDynamicTable(target, heading, tblid = "", subtotal, XFD, p1Name, p1, p2Name = "ddl2", p2 = 0) {
    
    //Request JSON data
    var URL = '{url to your json data here}'; // replace curly brackets with url to dynaic data feed

    $.getJSON(URL, {
        "xfd" : XFD,
        "pid" : 0,
        [p1Name] : p1,
        [p2Name] : p2
    }, 

    // On Successfully Getting Data Create Table
    function(myData){
        //Start with headings
        // EXTRACT KEY, FROM KEY:VALUE PAIRS IN YOUR JSON OBJECT, FOR THE HTML HEADERS, AND PUSH TO AN ARRAY. 
        // EXAMPLE ('ClinicID', 'Clinic', 'Department', 'Assignment', 'Column For Each Date')
        var col = [];
        for (var i = 0; i < myData.length; i++) {
            for (var key in myData[i]) {
                if (col.indexOf(key) === -1) {
                    col.push(key);
                }
            }
        }

        // CREATE THE DYNAMIC TABLE OBJECT
        var table = document.createElement("table");
        $(table).attr({
          id: tblid,
          class: 'table table-bordered table-striped'
        });

        // CREATE/ADD THE TABLE HEAD SECTION
        var thead = table.createTHead();
        
        // CREATE/ADD THE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ARRAY ABOVE.
        var tr = thead.insertRow(-1);                   // INSERT TABLE HEAD ROW.

        for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th");      // CREATE THE TH ELEMENT FOR EACH HEADER IN THE ARRAY.
            th.innerHTML = col[i];
            tr.appendChild(th);
        }

        // CREATE/ADD THE TABLE BODY SECTION
        var tbody = table.createTBody();

        // ADD JSON DATA TO THE TABLE AS ROWS.
        // Insert a row for each record in the JSON Feed
        for (var i = 0; i < myData.length; i++) {       
            tr = tbody.insertRow(-1);

            for (var j = 0; j < col.length; j++) {
                var tabCell = tr.insertCell(-1);
                // Add the sum class to all columns after the 3rd column
                // The sum class needs to be set on the columns you wat to subtotal in the footer
                if (j > 2) {
                    tabCell.setAttribute('class', 'sum');
                }
                // Populate each cell with data from the curent record
                tabCell.innerHTML = myData[i][col[j]];
            }
        }

        // CREATE/ADD THE TABLE FOOTER ROW
        // insert a final row for the subtotal row of the table and set the class to subhead if subtotal exists.
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

    // On Error - return error - return no results found.
    .error(function() {
       Sys.WebForms.PageRequestManager.getInstance().add_endRequest(endRequestHandler) 
        function endRequestHandler(sender, args) {
        document.getElementById(target).innerHTML = "<h4>" + heading + "</h4><h5 class='resultError'>No Results Found</h5>"
        $('.' + p1Name).val(p1);
        $('.' + p2Name).val(p2);
       }   
    }); 
  }  // End CreateDynamicTable Function!
