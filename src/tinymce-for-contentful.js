window.contentfulExtension.init(function(api) {
  function tinymceForContentful(api) {
    api.window.startAutoResizer();

    function tweak(param) {
      var t = param.trim();
      if (t === "false") {
        return false;
      } else if (t === "") {
        return undefined;
      } else {
        return t;
      }
    }

    var tb = tweak(api.parameters.instance.toolbar);
    var mb = tweak(api.parameters.instance.menubar);

    tinymce.init({
      selector: "#editor",
      // plugins: api.parameters.instance.plugins,
      // toolbar: tb,
      // menubar: mb,
       
       readonly : 1,
       language: 'de',
  browser_spellcheck: true,
  plugins: 'paste code autolink image imagetools link media table hr lists wordcount',
  toolbar: 'formatselect bold italic underline indent outdent  numlist bullist removeformat image',
  menubar: 'edit insert',
  menu: {
    file: { title: 'Datei', items: 'newdocument restoredraft | preview | print ' },
    edit: { title: 'Bearbeiten', items: 'undo redo | cut copy paste | selectall | searchreplace | code' },
    view: { title: 'Ansicht', items: 'code | wordcount' },
    insert: { title: 'Einfügen', items: 'link image media hr inserttable' },
    format: { title: 'Format', items: 'strikethrough superscript subscript codeformat' },
    tools: { title: 'Werkzeuge', items: 'spellchecker spellcheckerlanguage | code wordcount' },
    table: { title: 'Tabelle', items: 'inserttable | cell row column | tableprops deletetable' },
    help: { title: 'Hilfe', items: 'help' }
  },
  toolbar_sticky: true,
  image_advtab: false,
  image_title: true,
  image_caption: false,
  image_description: false,
  block_formats: 'Absatz=p; Überschrift 1=h1; Überschrift 2=h2; Überschrift 3=h3',
  content_css: '//www.tiny.cloud/css/codepen.min.css',
  importcss_append: true,
  min_height: 300,
  min_width: 500,
  height: 300,
  width: 800,
  max_height: 1000,
  max_width: 1000,
  paste_data_images: true,

  resize: 'both',
  toolbar_mode: 'wrap',
      
      init_instance_callback : function(editor) {
        var listening = true;

        function getEditorContent() {
          return editor.getContent() || '';
        }

        function getApiContent() {
          return api.field.getValue() || '';
        }

        function setContent(x) {
          var apiContent = x || '';
          var editorContent = getEditorContent();
          if (apiContent !== editorContent) {
            //console.log('Setting editor content to: [' + apiContent + ']');
            editor.setContent(apiContent);
          }
        }

        setContent(api.field.getValue());

        api.field.onValueChanged(function(x) {
          if (listening) {
            setContent(x);
          }
        });

        function onEditorChange() {
          var editorContent = getEditorContent();
          var apiContent = getApiContent();

          if (editorContent !== apiContent) {
            //console.log('Setting content in api to: [' + editorContent + ']');
            listening = false;
            api.field.setValue(editorContent).then(function() {
              listening = true;
            }).catch(function(err) {
              console.log("Error setting content", err);
              listening = true;
            });
          }
        }

        var throttled = _.throttle(onEditorChange, 500, {leading: true});
        editor.on('change keyup setcontent blur', throttled);
      }
    });
  }

  function loadScript(src, onload) {
    var script = document.createElement('script');
    script.setAttribute('src', src);
    script.onload = onload;
    document.body.appendChild(script);
  }

  var sub = location.host == "contentful.staging.tiny.cloud" ? "cloud-staging" : "cloud";
  var apiKey = api.parameters.installation.apiKey;
  var channel = api.parameters.installation.channel;
  var tinymceUrl = "https://" + sub + ".tinymce.com/" + channel + "/tinymce.min.js?apiKey=" + apiKey;

  loadScript(tinymceUrl, function() {
    tinymceForContentful(api);
  });
});
