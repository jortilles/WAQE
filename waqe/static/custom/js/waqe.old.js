var q = [];

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
                script: wq.helpers.general.getExploreRepositoryServiceUrl(),
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
                selectedFile = $('#fileInput').val();

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
                    };
                    var successOverwriteCallback = function () {
                        $.prompt.close();
                        $.prompt($.i18n.prop("save_as_message_success_overwrite", i18nFileName), {
                            prefix: "popup"
                        });
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

    var myJsonQuery = myJsonQuerySend;

    var saveParams = {
        path: selectedFile,
        wqdef: JSON.stringify(myJsonQuery, "", 1)
    };

    var $uploadForm = $('<form action="' + wq.helpers.general.getSaveFileServiceUrl() + '" method="post" enctype="multipart/form-data">');
    $uploadForm.ajaxForm({
        data: saveParams,
        success: function (result) {
            if (result) {
                var json = wq.helpers.util.getServiceResultEvaluation(result);
                alert(" WQ.HELPERS" + JSON.stringify(json) + "\n");
                console.log(json);
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
    alert("Voy a enviar los datos del formulario!!!!"
    + "\n A la direccion WQ = "   + wq.helpers.general.getSaveFileServiceUrl());
    $uploadForm.submit();
};

function multisel_option() {
    $('#div_columns select').multiselect({
        enableClickableOptGroups: true,
        enableCollapsibleOptGroups: true,
        nonSelectedText: 'Choose  a value!',
        enableFiltering: true,
        includeSelectAllOption: true,
        maxHeight: 200,
        buttonWidth: 100,
        enableCaseInsensitiveFiltering: true,
        numberDisplayed: 1,
        autoOpen: true
    });
} 


$(function () {
    $(".container").addClass("container-fluid").removeClass("container");
	var height = $(window).height() - 22;
	$('#column_left').css('height', height);
});

param_filter_on_query = [];

function renderData() {
	param_query_model = "";
	var qlen = q.length;
	for (i = 0; i < qlen; i++) {
		var colslen = q[i].cols.length;
		for (j = 0; j < colslen; j++) {
			param_query_model = param_query_model + JSON.stringify(q[i].cat).replace(/[|]/g, ",").replace(/["]/g, "") + ",fi,";
			param_query_model = param_query_model + JSON.stringify(q[i].cols[j]).replace(/["]/g, "");
			param_query_model = param_query_model + "|";
		}
	}
	param_query_model = param_query_model.substring(0, param_query_model.length - 1);
	Dashboards.fireChange('param_query_model', param_query_model);
}

function delCol(colname) {
	for (i = 0; i < q.length; i++) {
		/** We check each category for a match*/
		for (var j = 0; j < q[i].cols.length; j++) {
			if (q[i].cols[j].split(",")[0] == colname) {
				/**We remove the reference to the colname we want to delete**/
				q[i].cols.splice(j, 1);
			}
		}
	}
	render_sel_columns.update();
	renderData();
}

function delFilter(filterdel) {
	var parfillen = param_filter_on_query.length;
	var column = filterdel.split('|')[0];
	var valuedel = filterdel.split('|')[1];
	for (i = 0; i < parfillen; i++) {
		/**We check or column match on param_filter_on_query */
		if (param_filter_on_query[i].column == column) {
			var filter = param_filter_on_query[i];
			var filterlen = filter.value.length;
			/**On column match we check its filter values*/
			for (var j = 0; j < filterlen; j++) {
				if (param_filter_on_query[i].value[j] == valuedel) {
					/**We remove the reference of the filter value we want to delete*/
					param_filter_on_query[i].value.splice(j, 1);
				}
			}
		} else if (param_filter_on_query[i].value.length === 0) {
			param_filter_on_query[i].splice(i, 1);
		}
	}
	/**Removal of param_filter_on_query when there are no filter values */
	for (i = 0; i < parfillen; i++) {
		if (param_filter_on_query[i] !== undefined) {
			if (param_filter_on_query[i].value.length === 0) {
				param_filter_on_query.splice(i, 1);
			}
		}
	}
	Dashboards.fireChange('param_filter_on_query', param_filter_on_query);
} 

