module Admin
  class VariantsController < Admin::BaseController
  
    def index;
      @variants = Variant.all
    end
  end
end
