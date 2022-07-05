'strict mode'

require.config({
    paths: {
        "jquery": "webjars/jquery/3.3.1-1/jquery.min",
        "ace/ext/language_tools": "webjars/ace/1.3.3/src/ext-language_tools",
        "xtext/xtext-ace": "xtext/2.18.0.M3/xtext-ace"
    }
});
require(["webjars/ace/1.3.3/src/ace"], function() {
    require(["xtext/xtext-ace"], function(xtext) {
        var editor = xtext.createEditor();
        editor.setTheme("ace/theme/monokai");


    });
});


console.log("Kapp")