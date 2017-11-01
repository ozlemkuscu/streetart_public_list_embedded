
let config = void 0,
  streetartModel = void 0,
  thisForm = void 0;

let repo = "streetart";
let httpHost;

const APP_DIV = '#streetartArtistListApp';
const APP_MODALS = 'streetartArtistListModals';
const app_container_id = "streetart_public_container";

let gblCurScroll = 0;
let gblArtistData = [];

$(function () {

  httpHost = '/* @echo ENV*/';//'dev';

  let cotApp = new CotApp();
  //@if ENV='local'
  cotApp.appContentKeySuffix = '';
  //@endif
  cotApp.loadAppContent({
    keys: ['streetart_config'],
    onComplete: function (data) {
      let key = "streetart_config";
      //@if ENV='local'
      config = JSON.parse(data[key]);
      //@endif
      //@if ENV!='local'
      config = data[key];
      //@endif
      //     thisForm.render($('.streetart_public_list_container'));

      listApprovedArtists().then(function () {
        initForm();
        drawListing();
      });
    }
  });

  //CotModelextends Backbone.Model, to manage data models
  streetartModel = new CotModel({
    "FirstName": "",
    "LastName": "",
    "ArtistAlias": "",
    "Organization": "",
    "PreferredContactName": "",
    "OrganizationDescription": "",
    "Email": "",
    "URL": "",
    "ContactMethod": "",
    "WorkToPublic": "",
    "Profile": "",
    "Exp": "",
    "WorkHistory": "",
    "chkCV": "",
    "document_dropzone": [],
    "image_dropzone": [],
    "fid": ""
  });

  //CotForm uses a custom subclass of CotView, which extends Backbone.view, to manage a CotForm instance
  thisForm = new streetartForm({
    id: 'streetart_form',
    title: 'Artist Form',
    model: streetartModel
  });

  function listApprovedArtists() {
    return $.ajax({
      type: 'GET',
      url: config.httpHost.root_public[httpHost] + config.api_public.get + repo + '/publicdisplay',
      //  url: 'https://was-inter-sit.toronto.ca/cc_sr_v1/retrieve/streetart/publicdisplay', 
      //  url: config.httpHost.artist_public[httpHost],
      dataType: 'json',
      async: false,
      crossDomain: true,
      timeout: 5000,
      success: function (data) {
        var keyArray = Object.keys(data);
        keyArray = shuffle(keyArray);

        for (var i = 0; i < keyArray.length; ++i) {
          gblArtistData[i] = data[keyArray[i]];
        }
      },
      error: function (jqXHR, textStatus) {
        console.log('An application error has occured. Please try again at a later date', textStatus);
      }
    });
  }
  function displayPreferred(item) {
    let checkVal = item.PreferredContactName;
    switch (checkVal) {
      case 'Full Name':
        return item.FirstName + " " + item.LastName;
      case 'Artist Alias':
        return item.ArtistAlias;
      case 'Business':
        return item.Organization;
      default:
        return '';
    }
  }
  function drawListing() {
    var strRows = "";
    $.each(gblArtistData, function (i, item) {
      let displayPreferredContactName = displayPreferred(item);
      let displayProfileVal = "";
      let checkVal = item.WorkToPublic;
      if (checkVal == "Yes") {
        if (item.OrganizationDescription != undefined) {
          displayProfileVal = item.OrganizationDescription.substring(0, 200);
        }
        displayProfileVal != "" ? displayProfileVal = displayProfileVal + "..." : "";
      }
      strRows += "<tr class='streetartartistlisttablerow' id='streetartartistlisttablerow" + i + "'>";
      strRows += "<td>";
      //  strRows += '<div class="hidden-print hidden-xs col-sm-2">';
      //  strRows += '</div>';
      strRows += '<div class="detailLine col-xs-12 col-sm-12">';
      strRows += '<div class="artistinfo">';
      strRows += '<h3 class="artistname">';
      strRows += '<a class="showdetail" data-toggle="tooltip" data-placement="bottom" title="View Artist Details for ' + displayPreferredContactName + '" href="#' + item.fid + '" data-doc-id="' + item.fid + '">';
      strRows += displayPreferredContactName + ' (View Profile)';
      strRows += '</a>';
      strRows += '</h3>';
      strRows += '</div>';
      strRows += '<div class="row">';
      strRows += '<div class="col-xs-12 col-sm-12 .profile">';
      strRows += '<div class="lic_address">' + displayProfileVal.trim();
      strRows += '</div>';
      strRows += '<div>';

      let imageURLSRC = [];
      let imageFileName = [];
      if (item.image_uploads.length > 0) {
        $.each(item.image_uploads, function (index, image) {
          let fileName = image.name;
          let fileVal = fileName;
          let fileExt = "";
          if (fileVal.lastIndexOf('.') > -1) {
            fileExt = fileVal.substring(fileVal.lastIndexOf('.') + 1);
            fileVal = fileVal.substring(0, fileVal.lastIndexOf('.'))
          }
          imageURLSRC[index] = config.httpHost.image_url_path[httpHost] + "/" + fileVal + "_" + image.bin_id + "." + fileExt;
          imageFileName[index] = fileName;
        })
      }

      for (let m = 0; m < imageURLSRC.length; m++) {
        strRows += '<a class="displayimage" data-toggle="tooltip" data-placement="bottom" title="View Art Work ' + (m + 1) + ' from ' + displayPreferredContactName + '" href="#2222" data-doc-id="' + imageURLSRC[m] + '" data-title="Work Example ' + (m + 1) + ' for ' + displayPreferredContactName + ' - File Name : ' + imageFileName[m] + '">'; // imageURLSRC[m]
        strRows += '<img class="viewworkpics icons" data-toggle="tooltip" data-placement="bottom" title="Work Example ' + (m + 1) + ' for ' + displayPreferredContactName + ' - File Name : ' + imageFileName[m] + '" alt="Work Example ' + (m + 1) + ' for ' + displayPreferredContactName + ' - File Name : ' + imageFileName[m] + '" src="' + imageURLSRC[m] + '">';
        strRows += '</a>';
      }

      strRows += '</div>';
      //  strRows += '<div class="hidden-print hidden-xs col-sm-2"></div>';
      strRows += "</td></tr>";

    });
    strRows += '';
    strRows += '<tr class="streetartartistlisttextrow"><td>';
    //  strRows += '<div class="hidden-print hidden-xs col-sm-2"></div>';
    strRows += '<div class="col-xs-12 col-sm-12"><div class="row headerrow">' + config["Declaration"] + '</div></div>';
    strRows += '</td></tr>';

    strRows += '';
    strRows = (strRows === "") ? "<tr><td>No artists were found.</td></tr>" : strRows;

    let strRowsHead = '';
    strRowsHead = '<tr class="streetartartistlisttextrow"><td>';
    //  strRowsHead += '<div class="hidden-print hidden-xs col-sm-2"></div>';
    strRowsHead += '<div class="col-xs-12 col-sm-12"><div class="row headerrow">' + config["List Header Text1"] + '</div></div>';
    //  strRowsHead += '<div class="hidden-print hidden-xs col-sm-2"></div>';
    strRowsHead += '</td></tr>';
    strRowsHead += '<tr class="streetartartistlisttextrow"><td>';
    //  strRowsHead += '<div class="hidden-print hidden-xs col-sm-2"></div>';
    strRowsHead += '<div class="col-xs-12 col-sm-12"><div class="row headerrowcolored">' + config["List Header Text2"] + '</div></div>';
    //  strRowsHead += '<div class="hidden-print hidden-xs col-sm-2"></div>';
    strRowsHead += '</td></tr>';
    strRows = '<tbody>' + strRowsHead + strRows + '</tbody>';

    $("#streetartartistlisttable").html(strRows);
    //$('.streetart_public_list_container').html(strRows);
  }
  function shuffle(o) { //shuffles the artist profiles
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  };
  function initForm() {
    var mainContent = $(APP_DIV);
    mainContent.on("click", ".showdetail", function (event) { drawDetail($(this).data("doc-id")); });
    mainContent.on("click", ".displayimage", function (event) { drawImage($(this).data("doc-id"), $(this).data("title")); });
  }
  function drawImage(imageURL, titleVal) {
    let strHTML = "";
    strHTML += '<div>';
    imageURL = '<img class="workpics" alt="Work Example" src="' + imageURL + '">';
    strHTML += imageURL;
    strHTML += '</div>';
    CotApp.showModal({ title: titleVal, body: strHTML }); //embedded apps
  }
  function drawDetail(strID) {
    var strHTML = "";
    $.each(gblArtistData, function (i, item) {
      //  console.log(item);
      if (item.fid === strID) {
        strHTML += '<div>';
        strHTML += '<div class="detailrow"><span class="detaillabel">' + config["Email Modal"] + ' : </span><span>' + item.Email + '</span></div>';
        strHTML += '<div><span class="detaillabel">' + config["URL Modal"] + ' : </span><span>' + item.URL + '</span></div><br/>';
        strHTML += '<div class="detaillabel">' + config["Artist Bio Modal"] + '</div><div>';
        strHTML += (item.OrganizationDescription != undefined) ? item.OrganizationDescription.replace(/\n/g, '<br/>') : "";
        strHTML += '</div><br/>';
        let checkVal = item.WorkToPublic;
        if (checkVal == "Yes") {
          strHTML += '<div class="detaillabel">' + config["Profile Modal"] + '</div><div>';
          strHTML += (item.Profile != undefined) ? item.Profile.replace(/\n/g, '<br/>') : "";
          strHTML += '</div><br/>';
          strHTML += '<div class="detaillabel">' + config["Experience Modal"] + '</div><div>';
          strHTML += (item.Exp != undefined) ? item.Exp.replace(/\n/g, '<br/>') : "";
          strHTML += '</div><br/>';
          strHTML += '<div class="detaillabel">' + config["Work History Modal"] + '</div><div>'
          strHTML += (item.WorkHistory != undefined) ? item.WorkHistory.replace(/\n/g, '<br/>') : "";
          strHTML += '</div><br/>';
        }
        strHTML += '<div class="detaillabel">' + config["Images Section Modal"] + '</div>';
        //EXAMPLES OF WORK
        strHTML += '<div>';
        let imageURLSRC = [];
        if (item.image_uploads.length > 0) {
          $.each(item.image_uploads, function (index, image) {
            let fileVal = image.name;
            let fileExt = "";
            if (fileVal.lastIndexOf('.') > -1) {
              fileExt = fileVal.substring(fileVal.lastIndexOf('.') + 1);
              fileVal = fileVal.substring(0, fileVal.lastIndexOf('.'))
            }
            // file name structure from server is : filename_binid_fileextension
            imageURLSRC[index] = config.httpHost.image_url_path[httpHost] + "/" + fileVal + "_" + image.bin_id + "." + fileExt;
            strHTML += '<img class="workpics icons" title="Work Example ' + (index + 1) + '" alt="Work Example ' + (index + 1) + '" src="' + imageURLSRC[index] + '">';
          })
        }
        strHTML += '</div>';
        if (item.chkCV == 'Yes') {
          //CV/RESUME
          if (item.doc_uploads.length > 0) {
            let fileVal = item.doc_uploads[0].name;
            let fileExt = "";
            if (fileVal.lastIndexOf('.') > -1) {
              fileExt = fileVal.substring(fileVal.lastIndexOf('.') + 1);
              fileVal = fileVal.substring(0, fileVal.lastIndexOf('.'))
            }
            strHTML += '<div class="detaillabel">' + config["CV Modal"] + '</div>';
            let docURLSRC = config.httpHost.image_url_path[httpHost] + "/" + fileVal + "_" + item.doc_uploads[0].bin_id + "." + fileExt;
            strHTML += '<div><a href="' + docURLSRC + '">' + fileVal + '</a><div>';
          }
        }
        strHTML += '<br/>';
        strHTML += '<div><em>' + config["Declaration Modal"] + '</em></div>';
        strHTML += '</div>';
        CotApp.showModal({ title: '<strong>' + displayPreferred(item).toUpperCase() + '</strong>', body: strHTML }); //embedded apps
        return false; //this line will exit the each loop when one record matches the criteria
      }
    });
  }
});
//displayPreferredContactName
