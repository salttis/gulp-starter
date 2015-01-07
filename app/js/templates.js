this["tmpl"] = this["tmpl"] || {};
this["tmpl"]["template"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"container\">\n  <h1>"
    + escapeExpression(((helper = (helper = helpers.hello || (depth0 != null ? depth0.hello : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"hello","hash":{},"data":data}) : helper)))
    + " "
    + escapeExpression(((helper = (helper = helpers.world || (depth0 != null ? depth0.world : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"world","hash":{},"data":data}) : helper)))
    + "</h1>\n  <img src=\"img/pipboy.jpg\" alt=\"Pipboy!\">\n</div>";
},"useData":true});;