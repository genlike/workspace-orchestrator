'strict mode'

require.config({
    paths: {
        "jquery": "webjars/jquery/3.3.1-1/jquery.min",
        "ace/ext/language_tools": "webjars/ace/1.3.3/src/ext-language_tools",
        "xtext/xtext-ace": "xtext/2.26.0/xtext-ace"
    }
});
require(["webjars/ace/1.3.3/src/ace"], function() {
    require(["xtext/xtext-ace"], function(xtext) {
        var editor = xtext.createEditor(
            {
                baseUrl: '/',
                serviceUrl: 'http://localhost:3000/xtext-sericve',
                syntaxDefinition: 'xtext-resources/generated/mode-rsl.js',
                enableCors: true
            });
        editor.setTheme("ace/theme/monokai");


    });
});
