/*
MIT License

Copyright (c) 2018  Juan José Ortilles -  Jortilles  (http://www.jortilles.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

 /*  waqe.js  - */


var w = {};

w.query = {
	domain: null,
	model: null,
	selectedColumns: [],
	filter:[]
	
};


w.availableModels = [];
w.availableCategories = [];
w.filters = [];

w.model = {
	domain: null,
	model: null,
	modelName: null
};
w.loadedModelModel = {
	domain: null,
	model: null,
	modelName: null
};
w.loadedModel =  false;

w.category = {
	domain: null,
	model: null,
	id: null,
	name: null,
	columns: null
};

/*
Query model
*/
w.getMetadataDomains = function(){
        $.ajax({
                url:   Dashboards.getWebAppPath() +'/content/ws-run/metadataService/listBusinessModelsJson',
                type:  'get',
				dataType: 'xml',
                beforeSend: function () {
                    //    console.log('Asking form MD domains....');
                },
                success:  function (response) {
						//console.log(response); 
						var res =  $(response).find('return').text();
						//console.log(res); 
						MD = JSON.parse( res);
						for (var i = 0; i < MD.length; i++){
						  var obj = MD[i];
						  var m = {};
						  m.domain = obj.domainId;
						  m.model = obj.modelId;
						  m.modelName = obj.modelName;  
						  w.availableModels[i] = m ;					  
						}
						//console.log(w.availableModels);
                }
        });
};


w.getMetadataModelCategories = function( domain, model ){
        $.ajax({
                url:   Dashboards.getWebAppPath() +'/content/ws-run/metadataService/loadModel?domainId=' +  domain + '&modelId=' + model ,
                type:  'get',
				dataType: 'xml',
                beforeSend: function () {
                    //    console.log('Asking form MD domain Models....domainId=' +  domain + '&modelId=' + model);
                },
                success:  function (response) {
						//console.log(response);
						$(response).find('categories').each(function(){
							var cat = {};
							cat.domain = domain;
							cat.model = model;
							cat.id = $(this).find('categories > id' ).text() ;
							cat.name = $(this).find('categories > name' ).text() ;
							var columns = [];
							$(this).find('columns').each(function(){
								//console.log( $(this).text()   );  
								var c = {};
								c.domain = cat.domain;
								c.model = cat.model;
								c.categoryId = cat.id;
								c.id = $(this).find('categories > columns > id' ).text() ;
								c.name =  $(this).find('categories > columns > name' ).text() ; 
								c.type =   $(this).find('categories > columns > type' ).text() ;  
								c.aggTypes =  $(this).find('categories > columns > aggTypes' ).text() ;  
								columns.push( c ) ;
							}); 
							cat.columns = columns;
							w.availableCategories.push( cat );
						}); 
						// console.log( w.availableCategories  );  
                }
        });
};

w.runQuery = function(  datos ){
	var headers = [];
	var types = [];
				
				
	/**Header of the Query**/
	
	
	if(  w.query.selectedColumns.length > 0 ) {
		var myJsonQuery = {
			"class": "org.pentaho.common.ui.metadata.model.impl.Query",
			"domainName": w.query.domain,
			"modelId":  w.query.model,
			"disableDistinct": false,
			"defaultParameterMap": null,
			"columns": [],
			"conditions": [],
			"orders": []
		};
		var el = [];
		/**Columns of the Query**/
		for (i = 0; i < w.query.selectedColumns.length; i++) {
			el =  w.query.selectedColumns[i].split('|-|');
			var col = {
				"class": "org.pentaho.common.ui.metadata.model.impl.Column",
				"aggTypes": [],
				"categoryId": el[2],
				"defaultAggType": "NONE",
				"fieldType": null,
				"id": el[3],
				"name": el[4],
				"selectedAggType": "NONE",
				"type": el[5]
			};
			
			myJsonQuery.columns[i] = col;
			// set the column headers for the table later on 
			headers[i] = el[4];
			// Set the column types for the table later on
			types[i] = el[5];
		}
		/**Order of the Query**/
		for (j = 0; j <  w.query.selectedColumns.length; j++) {
			el =  w.query.selectedColumns[j].split('|-|');
			var ord = {
				"class": "org.pentaho.common.ui.metadata.model.impl.Order",
				"categoryId": el[2],
				"column": el[3],
				"orderType": "ASC"
			};
			myJsonQuery.orders[j] = ord;
		}
		/**Filters of the Query**/
		/*  EJEMPLO:
			[{"class":"org.pentaho.common.ui.metadata.model.impl.Condition",
			"operator":"=","category":"CAT_PRODUCTS",
			"column":"BC_PRODUCTS_PRODUCTCODE",
			"columnName":"Product Code",
			"value":["S10_1949","S10_2016"],
			"comboType":"AND"}] */
		/* 	Filter operator type:  = | 	> | >= | < | <=  | EXACTLY MATCHES |  CONTAINS | DOES NOT CONTAIN | BEGINS WITH | ENDS WITH | IS NULL | IS NOT NULL  */	
		/*comboType  AND | 	OR | 	AND_NOT | 	OR_NOT 	*/
		
		for (i = 0; i < w.query.filter.length; i++) {
			el =  w.query.filter[i]
			var col = el.column.split('|-|');
			//console.log(el);
			var fil = {
			"class":"org.pentaho.common.ui.metadata.model.impl.Condition",
			"operator":"=",
			"category": col[2],
			"column": col[3],
			"value": el.elems,
			"comboType":"AND"
			};
			myJsonQuery.conditions[i] = fil;
			
		}
		

		
		
		//console.log('asking for ');
		//console.log( JSON.stringify(myJsonQuery) );
		
		/**AJAX Query**/
		var rowLimit = 100;
		var queryToSend = 'json=' + JSON.stringify(myJsonQuery) + '&rowLimit=' + rowLimit ;
		//console.log('SENT QUERY............');
		//console.log(queryToSend);
		var res;
		$.ajax({
			type: 'GET',
			url: Dashboards.getWebAppPath() +'/content/ws-run/metadataService/doJsonQueryToCdaJson',
			data: encodeURI(queryToSend),
			success: function (result) {
				//console.log(result);
				if (result.childNodes[0].textContent === "") {
				   $("#div_table").hide();
				   $("#div_info").html('<h1> No Data </h1>');
				   $("#div_info").show();
				   console.log('No Data');
				} else {
					console.log('DATA!!!!!');
					res = result.getElementsByTagName("return")[0].childNodes[0].textContent;
					//console.log(res);
					 $("#div_info").hide();
				    $("#div_table").show();
				}
			},
			error: function (e) {
				alert('Error: ' + JSON.stringify(e));
			}
		});
			
		// i haver result!!!!!
		if (res === undefined) {} else {
				datos = JSON.parse(res);
		}
		
		
		//console.log('run query datos....');
		//console.log(datos);
		 var datoslength = parseInt(datos.resultset.length, 10);
			if (datoslength > 0) {
				// Set te table headers
				render_table_run_query.chartDefinition.colHeaders  = headers;
				/**Setting column type */
				render_table_run_query.chartDefinition.colTypes = types;
			} else {
				render_table_run_query.chartDefinition.colHeaders = '';
				render_table_run_query.chartDefinition.colTypes = '';
				 $("#div_table").hide();
				 $("#div_info").html('<h1> No Data </h1>');
				 $("#div_info").show();
				 
			}	
	}
	return datos;
};


w.runQueryFilter = function(  col ){
	var headers = [];
	var types = [];
	var result = null;		
				
	/**Header of the Query**/
	var myJsonQuery = {
			"class": "org.pentaho.common.ui.metadata.model.impl.Query",
			"domainName": w.query.domain,
			"modelId":  w.query.model,
			"disableDistinct": false,
			"defaultParameterMap": null,
			"columns": [],
			"conditions": [],
			"orders": []
		};
		el =  col.split('|-|');
			var col = {
				"class": "org.pentaho.common.ui.metadata.model.impl.Column",
				"aggTypes": [],
				"categoryId": el[2],
				"defaultAggType": "NONE",
				"fieldType": null,
				"id": el[3],
				"name": el[4],
				"selectedAggType": "NONE",
				"type": null
			};
			
		myJsonQuery.columns[0] = col;

		/**Order of the Query**/
		var ord = {
				"class": "org.pentaho.common.ui.metadata.model.impl.Order",
				"categoryId": el[2],
				"column": el[3],
				"orderType": "ASC"
			};
		myJsonQuery.orders[0] = ord;
			
		//console.log('asking for ');
		//console.log( JSON.stringify(myJsonQuery) );
		
		/**AJAX Query**/
		var rowLimit = 1000;
		var queryToSend = 'json=' + JSON.stringify(myJsonQuery) + '&rowLimit=' + rowLimit ;
		//console.log('SENT QUERY............');
		//console.log(queryToSend);
		var res;
		$.ajax({
			type: 'GET',
			url: Dashboards.getWebAppPath() +'/content/ws-run/metadataService/doJsonQueryToCdaJson',
			data: encodeURI(queryToSend),
			success: function (result) {
				//console.log(result);
				if (result.childNodes[0].textContent === "") {
					console.log('No Data to filter');
				} else {
					console.log('DATA TO FILTER!!!!!');
					res = result.getElementsByTagName("return")[0].childNodes[0].textContent;
					//console.log(res);
				}
			},
			error: function (e) {
				alert('Error: ' + JSON.stringify(e));
			}
		});
			
		// i haver result!!!!!
		if (res === undefined) {} else {
				result = JSON.parse(res);
		}
		
	return result;
};


w.addFilter = function(filter){
	//console.log(filter);
	var match = false;
	for ( var i=0; i < w.query.filter.length; i++ ){
		if ( w.query.filter[i].column.toString() == filter.column.toString() ){
			w.query.filter[i] =  filter;
			match = true;
		}
	}
	if( match == false ){
		w.query.filter.push(filter);
	}
	/*
	console.log('Add filter:');
	console.log(w.query);
	console.log('Add filter----------------------');
	*/
}
/* this function remove a column from filtering if there is no more filters on this column*/
/* i recive the column */
w.removeColumnFiltering = function(col){
	
	for ( var i=0; i < w.query.filter.length; i++ ){
		if ( w.query.filter[i].column.toString() == col.toString() ){
			w.query.filter.splice(i,1)
		}
	}
}

w.init = function(){
	 $(".container").addClass("container-fluid").removeClass("container");
	 
	w.checkFile();
	w.getMetadataDomains();
	
	
	
}


/*
check if a file is open and provided on the url
*/
w.checkFile = function(){
	var file = "xx";
	try{
		file = Dashboards.getPathParameter();
	}catch( e ){
		console.log('No file provided');
	}
	
	if( file != "xx"){
		$.ajax({
					type: "GET",
					url: wq.helpers.general.getReadFileServiceUrl(file),
					data: {},
					dataType: "json",
					success: function(json) {
						if(json) {
							//console.log(json);
							//console.log( json.domain);
							
							w.loadedModelModel = jQuery.extend(true, {}, json);
							w.query  = jQuery.extend(true, {}, json);
							//console.log(w.loadedModelModel);
							w.loadedModel = true;
						}
					},
					async: false
				});		
	}
}



/*
Save funciton. To save the query
*/
w.save = function(){
	saving.saveAs();
}
/*
*
*   SAVING PROCESSS
*
*/
var saving = {};
saving.saveAs = function () {
    var selectedFile = "";
    var selectedFolder = "";

    var fileInfo = '<div id="container_id" class="folderexplorer" style="height:260px;"></div>' +
        '      <div style="padding-top:15px;">' +
        '       <table style="margin:0px">' +
        '        <tr>' +
        '         <td style="padding:0px; width:22%">' +
        '          <span class="folderexplorerfilelabel" style="font-size:11px; font-weight:bold; left:0px; top:-3px">' + $.i18n.prop("save_as_label_file_name") + ' *</span>' +
        '         </td>' +
        '         <td style="padding:0px">' +
        '          <input id="fileInput" type="text" value=""></input>' +
        '         </td>' +
        '        </tr>' +
        '       </table>' +
        '      </div>';

    var content = "<h2>" + $.i18n.prop("save_as_title") + "</h2><hr/><div>" + fileInfo + "</div>";

    $.prompt(content, {
        prefix: "popup",
        buttons: {
            Ok: 1,
            Cancel: 0
        },
        loaded: function () {

            $('#container_id').fileTree({
                root: '/',
                script:  wq.helpers.general.getExploreRepositoryServiceUrl(),
                expandSpeed: 1000,
                collapseSpeed: 1000,
                multiFolder: false,
                folderClick: function (obj, folder) {
                    if ($(".selectedFolder").length > 0) $(".selectedFolder").attr("class", "");
                    $(obj).attr("class", "selectedFolder");
                    selectedFolder = folder;
                    $("#fileInput").val("");
                }
            }, function (file) {
                $("#fileInput").val(file.replace(selectedFolder, ""));
                selectedFile = $("#fileInput").val();
            });
        },
        submit: function (e, v, m, f) {
            if (v == 1) {
                selectedFile = $('#fileInput').val().replace(".waqe", "");

                var validInputs = true;

                if (selectedFile.indexOf(".") != -1 && (selectedFile.length < 7 || selectedFile.lastIndexOf(".waqe") != selectedFile.length - 7)) {
                    $.prompt($.i18n.prop("save_as_message_invalid_file_extension"), {
                        prefix: "popup"
                    });
                    validInputs = false;
                } else if (selectedFolder.length === 0) {
                    $.prompt($.i18n.prop("save_as_message_no_folder_selected"), {
                        prefix: "popup"
                    });
                    validInputs = false;
                } else if (selectedFile.length === 0) {
                    $.prompt($.i18n.prop("save_as_message_no_file_name_entered"), {
                        prefix: "popup"
                    });
                    validInputs = false;
                }
                if (validInputs) {
                    if (selectedFile.indexOf(".waqe") == -1) selectedFile += ".waqe";

                    var i18nFileName = [];
                    i18nFileName.push(selectedFile);

                    var filePath = selectedFolder + selectedFile;

                    var successCallback = function () {
                        $.prompt.close();
						
                        $.prompt($.i18n.prop("save_as_message_success", i18nFileName), {
                            prefix: "popup"
                        });
						
						$(".popupclose").click();
                    };
                    var successOverwriteCallback = function () {
                        $.prompt.close();
						$.prompt($.i18n.prop("save_as_message_success_overwrite", i18nFileName), {
                            prefix: "popup"
                        });
						
						$(".popupclose").click();
                    };
                    var permissionDeniedCallback = function () {
                        $.prompt.close();
                        $.prompt($.i18n.prop("save_as_message_permission_denied", i18nFileName), {
                            prefix: "popup"
                        });
                    };
                    var errorCallback = function () {
						
                        $.prompt.close();
                        $.prompt($.i18n.prop("save_as_message_error", i18nFileName), {
                            prefix: "popup"
                        });
                    };

                    var fileExists = false;
                    $("li.file.ext_waqe a").each(function (i) {
                        fileExists = $(this).text() === selectedFile;
                        return !fileExists;
                    });
                    if (fileExists) {
                        $.prompt($.i18n.prop("save_as_message_confirm_overwrite", i18nFileName), {
                            buttons: {
                                Ok: true,
                                Cancel: false
                            },
                            prefix: "popup",
                            submit: function (e, v, m, f) {
                                if (v) saving.save(filePath, successOverwriteCallback, permissionDeniedCallback, errorCallback);
                            }
                        });
                    } else {
                        saving.save(filePath, successCallback, permissionDeniedCallback, errorCallback);
                    }
                }
                return false;
            }
        }
    });
};

saving.save = function (selectedFile, successCallback, permissionDeniedCallback, errorCallback) {
    
	
    var saveParams = {
        path: selectedFile,
        //wqdef: JSON.stringify(myJsonQuery, "", 1)
		wqdef: JSON.stringify( w.query)
    };
	
	//console.log(w.query);
	//console.log(saveParams);
	
    var $uploadForm = $('<form action="' +  wq.helpers.general.getSaveFileServiceUrl() + '" method="post" enctype="multipart/form-data">');
    $uploadForm.ajaxForm({
        data: saveParams,
        success: function (result) {
            if (result) {
                var json = wq.helpers.general.getServiceResultEvaluation(result);
                //alert(" WQ.HELPERS" + JSON.stringify(json) + "\n");
                //console.log(json);
                if (json.status == "true") {
                    successCallback();
                } else {
                    if (json.result.toLowerCase().indexOf("access denied") != -1) {
                        permissionDeniedCallback();
                    } else {
                        errorCallback();
                    }
                }
            }
        }
    });
   // alert("Voy a enviar los datos del formulario!!!! \n A la direccion WQ = "   + wq.helpers.general.getSaveFileServiceUrl());
    $uploadForm.submit();
};