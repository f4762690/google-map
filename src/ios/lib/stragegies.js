const rules = {
  pointCheck:(value,error)=>{
    if(!/^-*\d+\.\d+,-*\d+\.\d+$/.test(value)||value == ''){
      return error
    }
  }
};

export default rules;
