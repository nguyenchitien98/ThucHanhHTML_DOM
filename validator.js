// Đối tượng Validator
function Validator(options) {
    function getParent(element,selector){
      while(element.parentElement) {
        if(element.parentElement.matches(selector)) {
          return element.parentElement;
        }
        element = element.parentElement;
      }
    }

    var selectorRules = {}; 

    // Hàm thực hiện validate
    function Validate(inputElement, rule) {
        // var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);

        //  var errorMessage = rule.test(inputElement.value);
        var errorMessage;

         // Lấy ra các rule và kiểm tra
         var rules = selectorRules[rule.selector];

         // Lặp qua từng rule và kiểm tra
         // Nếu có lỗi thì dừng việc kiểm tra
         for (var i = 0; i < rules.length; i++) {
          switch (inputElement.type) {
            case "radio":
                errorMessage = rules[i](formElement.querySelector(rule.selector +':checked'));
                break;  
            case "checkbox":
                errorMessage = rules[i](formElement.querySelector(rule.selector +':checked'));
                break; 
            default:
                errorMessage = rules[i](inputElement.value);
          }
          if(errorMessage) break;
         }

         if (errorMessage) {
           errorElement.innerText = errorMessage;
           getParent(inputElement,options.formGroupSelector).classList.add("invalid");
         } else {
           errorElement.innerText = "";
           getParent(inputElement,options.formGroupSelector).classList.remove("invalid");
         }
         return !errorMessage;
    };

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);
    
    if (formElement) {
        formElement.onsubmit = function(e) {
          e.preventDefault();

          var isFormValid = true;
          
          // Lặp qua từng rules và validate
          options.rules.forEach(function(rule){
            var inputElement = document.querySelector(rule.selector);
            var isValid = Validate(inputElement, rule);
            if(!isValid){
              isFormValid = false;
            }
          });

          if(isFormValid) {
            // Trường hợp submit với JavaScript
            if (typeof options.onSubmit === "function") {
              var enableInputs = formElement.querySelectorAll("[name]");
              var formValues = Array.from(enableInputs).reduce(function (values,input) {
                switch (input.type) {
                  case "radio":
                    values[input.name]=formElement.querySelector('input[name="' + input.name + '"]:checked')?.value;
                    break;
                  case "checkbox":
                    if(!input.matches(':checked')) return values;
                    if(!Array.isArray(values[input.name])){
                      values[input.name]=[];
                    }
                    values[input.name].push(input.value);
                    break;
                  case "file":
                    values[input.name] = input.files;
                    break;   
                  default:
                    values[input.name] = input.value;
                }
                
                return values;
              },
              {});

              options.onSubmit(formValues);
            }
            // Trường hợp submit với hành vi mặc định
            else {
              formElement.submit();
            }
          }
        }


      // Lặp qua mỗi rule và xử lý ( lắng nghe sự kiện blur, iput ...)
        options.rules.forEach(rule =>{

          // lưu lại các rules cho mỗi input
          if(Array.isArray(selectorRules[rule.selector])){ 
            selectorRules[rule.selector].push(rule.test);
          } else {
            selectorRules[rule.selector] = [rule.test];
          }

            var inputElements = document.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement){
              // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function() {
                    // console.log(inputElement.value);
                   Validate(inputElement,rule);
                }

                // Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function (){
                    var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(
                      options.errorSelector
                    );
                    errorElement.innerText = '';
                    getParent(inputElement,options.formGroupSelector).classList.remove("invalid");
                }
            });
        });
    }
}

// Định nghĩa rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi => Trả ra messages lỗi
// 2. Khi hợp lệ => Không trả ra cái gì (undefined)
Validator.isRequired = function(selector,messages) {
    return  {
        selector: selector,
        test: function(value){
            return value
              ? undefined
              : messages || "Vui lòng nhập trường này";
        }
    }
}

Validator.isEmail = function (selector, messages) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : messages || "Trường này phải là email";
    },
  };
};

Validator.minLength = function (selector, min, messages) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : messages || `Vui lòng nhập tối thiểu ${min} ký tự`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmValue, messages) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : messages || "Gía trị nhập vào không chính xác";
    }
  }
}