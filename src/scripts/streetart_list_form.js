let streetartForm = CotView.extend({
  initialize: function(){
  },
  render: function(container){
    container.append(this.el);
    this._form = new CotForm(this.formDefinition());
    this._form.render({target:this.el});
    this._form.setModel(this.model);
    return this;
  },
  formDefinition: function() {
    return {
      id: this.id,
      title: this.title,
      rootPath: '/resources/streetart_public_list/',
      success: function(){},
      useBinding: true,
      sections: []
    };
  }
});

