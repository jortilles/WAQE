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

/*  wd ==> Waqe dashoboards util*/ 

wdu = {};
/*
Reset query 
*/
wdu.resetQuery = function(){
	$("#selected_columns").find('li').remove(); 
	$("#div_table").hide();
	w.query.selectedColumns = [];
	w.query.filter = [];
	w.availableCategories = [];
	w.filters = [];
	Dashboards.fireChange('param_run_query', param_run_query + 1 );
};


 
//------------------------------------------------------------
//------------------------------------------------------------
//------------------------------------------------------------
wdu.select_model_Pre = function(){
	if(w.loadedModel == true){
		param_selected_model =   w.loadedModelModel.domain + '|-|' + w.loadedModelModel.model;
		try{
			param_selected_category = w.loadedModelModel.selectedColumns[0].split('|-|')[2];
		}catch(e){ console.log('No columns selected in loaded model ');}
	}
};
 
wdu.select_model_PostChange = function(){
	//Reset query
	wdu.resetQuery();
	
};

wdu.select_model_PostFetch = function(data){
	var foo = [];
	var fii = [];
	var rest = [];
	var res =  JSON.parse( '	{ "resultset":[     ],   "metadata":[      {"colIndex":0,"colType":"String","colName":"value"},      {"colIndex":1,"colType":"String","colName":"name2"}   ]}' );
	for (var i = 0; i < w.availableModels.length; i++){
						  var obj = w.availableModels[i];
						  var m = [ obj.domain + '|-|' + obj.model , obj.domain + ' - ' + obj.modelName   ];
						  foo[i] = m ;
						}
	//console.log('select_model_PostFetch');
	//console.log(w.availableModels);
	//console.log(foo);
	 // i put the selected the first
	 for(var j =0; j<foo.length; j++ ){
		  //console.log(   foo[j].toString()      );
		 if(  foo[j][0].toString() == param_selected_model.toString()  ){
			 fii[0] = foo[j];
		 }else{
			 rest.push(foo[j]);
		 }
	 }
	res.resultset = fii.concat(rest);
	//console.log('wdu.select_model_PostFetch');
	//console.log(res);
	return res;
};



//------------------------------------------------------------
//------------------------------------------------------------
//------------------------------------------------------------
wdu.select_category_Pre = function(){
	
};

wdu.select_category_PostFetch = function(data){
	/*
	console.log('Model selected Lets load the categories for this model ');
	console.log( 'select_category_PostFetch' + param_selected_model  );
	console.log('We have pre-selected the category '  +  param_selected_category );
	*/
	var foo = [];
	var fii = [];
	var rest = [];
	var res =  JSON.parse( '{ "resultset":[],"metadata":[{"colIndex":0,"colType":"String","colName":"value"},{"colIndex":1,"colType":"String","colName":"name2"}]}' );
	foo =  param_selected_model.split('|-|');
	w.query.domain = foo[0];
	w.query.model=foo[1];
	w.getMetadataModelCategories( w.query.domain, w.query.model );

	for (var i = 0; i < w.availableCategories.length; i++){
					var obj =w.availableCategories[i];
					//console.log('obj....');
					//console.log(obj);
					var m = [ obj.domain + '|-|' + obj.model + '|-|' + obj.id  ,   obj.name   ];
					foo[i] = m ;
	}
	
	for(var j =0; j< w.availableCategories.length; j++ ){
		
		 if(  foo[j][0].split('|-|')[2].toString() == param_selected_category.toString()  ){
			 fii[0] = foo[j];
		 }else{
			 rest.push(foo[j]);
		 }
	 }
	res.resultset = fii.concat(rest);
	//console.log('select_category_PostFetch Paso ' + rest);
	return res;
	
};


 wdu.select_category_PostChange = function(){
	 //"steel-wheels|-|BV_ORDERS|-|CAT_PRODUCTS"
	 if( param_selected_category != null   ){
		var foo =  param_selected_category.split('|-|');
		//console.log('avail cat');
		//console.log( w.availableCategories );
		var tmp = [];
		for( var i = 0; i <w.availableCategories.length; i++ ){
			var obj =w.availableCategories[i];
			//console.log(obj);
			if( obj.id == foo[2] ){
				//console.log('listing columns');
				//console.log(obj);
				for( var j = 0; j< obj.columns.length; j++){
						  var m = [  obj.columns[j].domain  + '|-|' +  obj.columns[j].model  + '|-|' +  obj.columns[j].categoryId   + '|-|' +  obj.columns[j].id + '|-|' +  obj.columns[j].name  + '|-|' +  obj.columns[j].type,  obj.columns[j].name   ];
						  //console.log( m );
						  tmp[j] = m ;
				}
			}else{
				//console.log( 'NO MATCH ' +   obj.id  +  '--' + foo[2]  );   
			}
		}
			wdu.mountColumnSelect(  tmp ) ;
	}else{
		console.log('No category  selected');
	}
};
//------------------------------------------------------------
//------------------------------------------------------------
//------------------------------------------------------------
wdu.table_run_query_Pre = function(){
	wdu.show_filters(); 
};
wdu.table_run_query_PostFetch = function( datos ){
		var data = w.runQuery( datos ); 
		return data;
};
//------------------------------------------------------------
//------------------------------------------------------------
//------------------------------------------------------------

wdu.show_filters = function(){
	var list = 'Filter by: ';
	for ( var i=0; i < w.query.filter.length; i++ ){
		list += w.query.filter[i].column.split('|-|')[4] + ': '
		for( var j=0; j <  w.query.filter[i].elems.length; j++) {
			list += '<a href="#" onClick="wdu.removeFilter(\'' + w.query.filter[i].column + '\', \''+  w.query.filter[i].elems[j] +'\');" > ' +    w.query.filter[i].elems[j]  + '</a>';
		}
	}
	
	 $("#div_filter").html(list);

};

wdu.removeFilter = function( column, elem){
	//console.log('wdu.removeFilter llega column: ' +  column + ' elem: ' + elem );
	for ( var i=0; i < w.query.filter.length; i++ ){
		if( w.query.filter[i].column ==  column ){
			$.each( w.query.filter[i].elems, function(j){
					if(w.query.filter[i].elems[j] ===  elem ) {
						w.query.filter[i].elems.splice(j,1);
						return false;
					}
				});
		} 
	}
	for ( var i=0; i < w.query.filter.length; i++ ){
		if( w.query.filter[i].elems.length  ==  0 ){
				w.query.filter.splice(i,1);
		} 
	}	
	
	Dashboards.fireChange('param_run_query', param_run_query + 1 );
	render_multisel_filter_elements.update();
	
};

wdu.mountColumnSelect = function( arr ){
	
	var available = " <ul id='available_columns' class='connectedSortable'>";
	var selected = "";
	
	if( w.loadedModel == true ){
		w.query =  jQuery.extend(true, {},  w.loadedModelModel);
		w.loadedModel = false;
	}

	// Set the available columns....
	for (var i = 0; i < arr.length; i++){
		if(  w.query.selectedColumns.indexOf(  arr[i][0]  ) < 0  ){
			available += "  <li class='ui-state-default btn btn-default' data-toggle='modal' data-target='#myModal'  onClick='wdu.filter(\"" + arr[i][0] + "\");'  id='" + arr[i][0] +  "' >" + arr[i][1] +  "</li> ";
		}
	}
	available += "</ul> ";
	
	// Set the selected ones...
	for (var i = 0; i < w.query.selectedColumns.length; i++){
			var col = w.query.selectedColumns[i].split('|-|');
			selected += "  <li class='ui-state-default btn btn-default'  data-toggle='modal' data-target='#myModal'  onClick='wdu.filter(\"" +  w.query.selectedColumns[i] + "\");'  id='" + w.query.selectedColumns[i] +  "' >" +  col[4] +  "</li> ";
	}
	if(  selected.length == 0){
		selected = "<li class='ui-state-default btn btn-default' id='0' >Drop elements here</li>"
	}
	
	$("#div_select_columns").html(available);
	$("#selected_columns").html(selected);
	   
	 /**Sortable */
    $(function () {
        $("#available_columns, #selected_columns").sortable({
            connectWith: ".connectedSortable"
        }).disableSelection();
    });
	
	$('#selected_columns').sortable({

		update: function( event, ui ) {
			   //console.log(   'update'  );
			   //console.log( $('#selected_columns li') );
			   var cols = [];
			   var val ;
			  	$('#selected_columns li').each(function(){  
						val =  $(this).attr("id") ;
						//console.log(val);
						try{
						if(  val.length  > 1   ){
							cols.push(  val  ) ;
						}
						}catch(e){}
				w.query.selectedColumns = cols;
				//console.log(cols);
				Dashboards.fireChange('param_run_query', param_run_query + 1 );
				
				selected = "";
				for (var i = 0; i < w.query.selectedColumns.length; i++){
				var col = w.query.selectedColumns[i].split('|-|');
						selected += "  <li class='ui-state-default btn btn-default'  data-toggle='modal' data-target='#myModal'  onClick='wdu.filter(\"" + w.query.selectedColumns[i] + "\");'  id='" + w.query.selectedColumns[i] +  "' >" +  col[4] +  "</li> ";
				}
				if(  selected.length == 0){
					selected = "<li class='ui-state-default btn btn-default' id='0' >Drop elements here</li>"
				}

				$("#selected_columns").html(selected);
	
	
	
				});
		}
		/* 
		,
				remove: function( event, ui ) {
			  console.log(   'Removed'  );
			  var cols = [];
			  	$('#selected_columns li').each(function(){  
					if(  $(this).attr("id")  !== null ){
						cols.push(  $(this).attr("id")  ) ;
						
					} 
				w.query.selectedColumns = cols;
				Dashboards.fireChange('param_run_query', param_run_query + 1 );
				});
		},
		receive: function( event, ui ) {
			  console.log(   'Receive'  );
			   var cols = [];
			   var val ;
			  	$('#selected_columns li').each(function(){  
						val =  $(this).attr("id") ;
						console.log(val);
						try{
							if(  val.length  > 1   ){
								cols.push( val ) ;
							}
						}catch(e ){}
				w.query.selectedColumns = cols;
				Dashboards.fireChange('param_run_query', param_run_query + 1 );
				});
		}
		*/
		
		
	});
	
}
wdu.filtering = "";
wdu.filter = function(col){
	//console.log(col);
	wdu.filtering = col;
	$('#div_filter_lbl').text( 'Filter on: ' + col.split('|-|')[4]);
	
	render_multisel_filter_elements.update();
}

 
 wdu.multisel_filter_elements_PostFetch = function(){
	var elems =w.runQueryFilter(wdu.filtering);

	return elems;
}

wdu.multisel_filter_elements_PreExecution = function(){
	// Initialize the filter
	for ( var i=0; i < w.query.filter.length; i++ ){
		if( w.query.filter[i].column.toString() == wdu.filtering.toString() ){
			//console.log(' multisel_filter_elements_PreExecution MATCH ' + w.query.filter[i].elems );
			param_filter_elements = w.query.filter[i].elems;
		}
	}
	
}

wdu.multisel_filter_elements_PostExecution = function(){
	$('#div_filter_elements select').multiSelect({ keepOrder: true,
	selectableHeader: "<div class='filter-header'>Available Elements:</div>",
	selectionHeader: "<div class='filter-header'>Selected Elements:</div>" });
}

wdu.multisel_filter_elements_PostChange = function(){
	var filter = {};
	filter = {
		column: null,
		elems:[]	
	};
	filter.column = wdu.filtering;
	for ( var i=0; i < param_filter_elements.length; i++ ){
		filter.elems.push(param_filter_elements[i] ); 
	}
	if(param_filter_elements.length == 0 ){
		w.removeColumnFiltering(wdu.filtering);
	}
	/*
	console.log('wdu.multisel_filter_elements_PostChange');
	console.log('lenght' + filter.elems.length );
	console.log(filter);
	*/
	
	if(filter.elems.length > 0 ){
		w.addFilter( filter );
	}
	Dashboards.fireChange('param_run_query', param_run_query + 1 );
}
