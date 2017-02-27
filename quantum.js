String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var Q$ = {
  "unequal":"Measurement classical register (_creg_) has not equal size to quantum register (_qreg_)",
  "q_undefined":"Qubit _reg_(_index_) not defined in current topology",
  "c_undefined":"Classical bit _reg_(_index_) not defined in current topology",
  "notconnected":"Control _reg_(_index_) cannot operate on _reg2_(_index2_) on this topology.",
  "orphan":"Qbit(_index_) doesn't have parent processor"
};

var π = {
  div : function (num) {
    num = num || 1;
    return 'pi/' + num;
  }
};

class QProcessor {
  
  constructor(topology) {
    this.operations = [];
    this.inits = [];
    this.creg = {};
    this.qreg = {};
    if (topology != undefined) {
      this.topology = topology;
      for (var reg in this.topology.creg) {
        this.setC(reg, this.topology.creg[reg]);
      }
      for (var reg in this.topology.qreg) {
        this.setQ(reg, this.topology.qreg[reg].length, this.topology.qreg[reg])
      }
    }
  }
  
  setFallback(fallback) {
    this.fallback = fallback;
  }
  
  setQ(reg, size, topologies) {
    reg = reg || 'c';
    size = size || 0;
    this.qreg[reg] = this.qreg[reg] || [];
    for (var i = this.qreg[reg].length; i < size; i++) {
        var topology = topologies ? topologies[i] : undefined;
        this.qreg[reg][i] = new QBit(reg, i, this, topology);
    }
  }
  
  setC(reg, size) {
    reg = reg || 'c';
    size = size || 0;
    this.creg[reg] = this.creg[reg] || [];
    for (var i = this.creg[reg].length; i < size; i++) {
        this.creg[reg][i] = 0;
    }
  }
  
  valMeasureSize(qbit, cbit) {
    var err = Q$['unequal'].replaceAll('_creg_', cbit.reg).replaceAll('_qreg_', qbit.reg);
    if (this.topology != undefined) {
      if (this.qreg[qbit.reg].length != this.creg[cbit.reg].length) {
        console.log(err);
        this.error(err);
      } else {
        return true;
      }
    } else {
      var max = Math.max(this.qreg[qbit.reg].length, this.creg[cbit.reg].length);
      this.setQ(qbit.reg, max);
      this.setC(cbit.reg, max);
    }
  }
  
  init(array, reg) {
    array = array || [];
    reg = reg || 'q';
    for (var i = 0; i < array.length; i++) {
      var val = array[i];
      var bit = this.bit(i, reg);
      bit.setScope('init');
      if (val == '1' || val == 1) { bit.x();
      } else if (val == '+') { bit.h();
      } else if (val == '-') { bit.h().z();
      } else if (val == '>' || val == 'r' || val == '+i') { bit.h().s();
      } else if (val == '<' || val == 'l' || val == '-i') { bit.h().s_();
      } else if (val == '=') { bit.id();
      }
      bit.setScope();
    }
  }
  
  bits() {
    return new QBit(null,null,this);
  }
  
  bit(index, reg) {
    if (typeof index === 'string' || index instanceof String) {
      reg = index;
      index = 0;
    }
    
    index == index || 0;
    reg = reg || "q";
        
    //IDEAL ARCHITECTURE
    var err = Q$['q_undefined'].replaceAll("_reg_",reg).replaceAll("_index_",index);
    if (this.topology == undefined) {
      if (this.qreg[reg] == undefined) {
        this.qreg[reg] = [];
      } 
      if (this.qreg[reg][index] == undefined) {
        this.qreg[reg][index] = new QBit(reg, index, this);  
      }
      return this.qreg[reg][index];
    } else if (this.qreg[reg] != undefined) { //CONSTRAINED TOPOLOGY
      if (this.qreg[reg][index] != undefined) {
        return this.qreg[reg][index];
      } else if (index == undefined) {
        return new QBit(reg, index, this);
      } else {
        this.error(err);
        return new QBit(reg, index, this);
      }
    } else {
      this.error(err);
      return new QBit(reg, index, this);
    }
  }
  
  cbit(index, reg) {
    if (typeof index === 'string' || index instanceof String) {
      reg = index;
      index = -1;
    }
    
    index = (index == undefined || index == null) ? -1 : index;
    reg = reg || 'c';
    //IDEAL ARCHITECTURE
    var err = Q$['c_undefined'].replaceAll("_reg_",reg).replaceAll("_index_",index);
    if (this.topology == undefined) {
      if (this.creg[reg] == undefined) {
        this.creg[reg] = [0];
        return new CBit(reg, index);
      } else if (this.creg[reg][index] == undefined) {
        this.creg[reg][index] = 0;
        return new CBit(reg, index);
      } else {
        return new CBit(reg, index, this.creg[reg][index]);
      }
    } else if (this.creg[reg] != undefined) { //CONSTRAINED TOPOLOGY
      if (this.topology.creg[reg] >= index) {
        return new CBit(reg, index, this.creg[reg][index]);
      } else {
        this.error(err);
        return new CBit(reg, index, 0);
      }
    } else {
      this.error(err);
      return new CBit(reg, index, 0);
    }
  }
  
  exists(index, reg) {
    reg = reg || 'q';
    if (this.topology == undefined) { return true; }
    return this.qreg[reg][index] != undefined ? true : false;
  }
  
  compile(callback) {
    var compiled = "include \"qelib1.inc\";";
    compiled += "\r\n\r\n";
    if (this.qreg != undefined) {
      for (var key in this.qreg) {
        compiled += "qreg _name_[_count_];\r\n"
        .replaceAll("_name_", key)
        .replaceAll("_count_", this.qreg[key].length || 0);
      }  
    }
    if (this.creg != undefined) {
      for (var key in this.creg) {
        compiled += "creg _name_[_count_];\r\n"
        .replaceAll("_name_", key)
        .replaceAll("_count_", this.creg[key].length || 0);
      }  
    }
    compiled += "\r\n";
    for (var i = 0; i < this.inits.length; i++) {
      compiled += this.inits[i];
      compiled += "\r\n";
    }
    compiled += "\r\n";
    for (var i = 0; i < this.operations.length; i++) {
      compiled += this.operations[i];
      compiled += "\r\n";
    }
    if (callback) callback(compiled);
    return compiled;
  }
  
  comment(text) {
      this.operations.push("// "+text);
  }
  
  add(operation, scope) {
    if (this.terminated) return;
    if (operation != undefined) {
      scope = scope || 'body';
      if (scope == 'body') {
        this.operations.push(operation);  
      } else if (scope == 'init') {
        this.inits.push(operation); 
      }
    }
  }
  
  barrier(indexes, reg) {
    if (typeof indexes == 'string') {
      reg = indexes;
      indexes = undefined;
    } 
    if (typeof indexes == 'number') {
      console.log("indexes is number");
      indexes = [indexes];
    }
    reg = reg || 'q';
    indexes = indexes || [];
    var arr = [];
    for (var i = 0; i < indexes.length; i++) {
      var index = indexes[i];
      var _bit = this.bit(index, reg);
      arr.push(_bit.name);
    }
    this.add("barrier " + (arr.join(',') || reg) + ";");
    return this;
  }
  
  brk() {
    this.add('');
    return this;
  }
  
  pre(test) {
    this.operations[this.operations.length-1] = test + this.operations[this.operations.length-1];
  }
  
  error(message) {
    console.log("ERROR: " + message);
    this.add(">>>>>>> ERROR: " + message);
    if (this.fallback) {
      this.fallback(message, this.compile());
    }
    this.terminated = true;
  }
  
}


class QBit {
  constructor(reg, index, Q, targets) {
    this.kind = "quantum";
    this.scope = 'body';
    this.targets = targets;
    this.index = index == undefined ? -1 : index;
    this.Q = Q;
    this.reg = reg || 'q';
    this.name = this.reg + (this.index < 0 ? "":("["+this.index+"]"));
  }
  
  bit(bit) {
    if (this.Q) this.Q.bit(bit);
  }
  
  error(message) {
    if (this.Q != undefined) {
      this.Q.error(message);
    }
  }
  
  setIndex(index){
    this.index = index;
    return this;
  }
  
  setQ(Q) {
    this.Q = Q;
    return this;
  }
  
  setScope(scope) {
    this.scope = scope || 'body';
  }
  
  openConditional(condition) { 
    this.condition = "if(" + condition + ") "; 
  }
  closeConditional() { 
    this.condition = undefined; 
  }
  
  validate(target, silent) {
    if (this.targets == 0 || this.targets == undefined || this.targets == null) { return true; }
    var targetIndex = target.index || target;
    if (this.targets.indexOf(targetIndex) != -1) {
      if (this.Q != undefined) {
        if (this.Q.exists(targetIndex)) {
          return true;
        } else {
          this.error(Q$['q_undefined'].replaceAll("_reg_",target.reg).replaceAll("_index_",target.index));
        }
      } else {
        this.error(Q$['orphan'].replaceAll("_index_",this.index));
      }
    } else {
      if (silent) console.log("me("+this.index+") targets: "+this.targets+" target("+target.index+").targets: "+target.targets);
      if (!silent) this.error(
        Q$['notconnected'].replaceAll("_index_",this.index).replaceAll('_reg_',this.reg)
        .replaceAll("_index2_",target.index).replaceAll("_reg2_",target.reg)
      );
    }
    return false;
  }
  
  operation(operation, _scope) {
    if (this.Q != undefined) {
      if (this.condition != undefined) {
        operation = this.condition + operation;
      }
      this.Q.add(operation.replaceAll("_q_", this.name), _scope);
    }
    return this;
  }
  
  pre(test) {
    if (this.Q != undefined) {
      this.Q.pre(test);
    }
    return this;
  }
  
  gate(name, bits){
    if (bits == undefined) {
      return this.operation(name+" "+this.name+";");
    } else {
      return this.operation(name + " _q_;".replaceAll("_q_", bits));
    }
  }
  
  isQBit(obj) {
    return typeof obj === 'object' && obj instanceof QBit;
  }
  
  getTarget(target) {
    if (!this.isQBit(target)) target = this.Q.bit(target, this.reg);
    if (this.validate(target)) return target; 
  }
  
  getTargetOrReverse(target) {
    if (this.validate(target, 'silent')) {
      return 2; 
    } else if (target.validate(this, 'silent')) {
      return 1;
    } else {
      return 0;
    }
  }
  
  controlled(gate, target) {
    target = this.getTarget(target);
    if (target) 
      this.operation(gate+" _q_,_qt_;".replaceAll("_qt_", target.name));
    return this;
  }
  
  acx(target) {
    if (!this.isQBit(target)) target = this.Q.bit(target, this.reg);
    var xcheck = this.getTargetOrReverse(target);
    if (xcheck == 2) {
      this.cx(target);
    } else if (xcheck == 1) {
      this.Q.comment("AUTO REVERSE NOT");
      target.rcx(this);
    } else {
      console.log(this.reg+this.index+" not target nor reverse of  "+target.reg+target.index);
      this.cx(target);
    }
  }
  
  h() { return this.gate("h"); }
  x() { return this.gate("x"); }
  y() { return this.gate("y"); }
  z() { return this.gate("z"); }
  s() { return this.gate("s"); }
  s_() { return this.gate("sdg"); }
  t() { return this.gate("t"); }
  t_() { return this.gate("tdg"); }
  id() { return this.gate("id"); }
  reset() { return this.gate("reset"); }
  u(values) { return this.gate("u" + values.length + "(" + values.join(",") + ")"); }
  cnot(target) { return this.cx(target); }
  cx(target) { return this.controlled("cx", target); }
  cy(target) { return this.controlled("cy", target); }
  cz(target) { return this.controlled("cz", target); }
  ch(target) { 
    target = this.getTarget(target);
    if (target) {
      this.s();
      target.h().s_();
      this.cx(target);
      target.h().t();
      this.cx(target);
      target.t().h().s().x();
    }
    return this;
  }
  
  toffoli(b,c) { return this.ccx(b,c); }
  ccx(b, c) {
    var a = this;
    b = a.getTarget(b);
    if (b) {
     c = b.getTarget(c);
      if (c) {          
        c.h();
        b.cx(c); c.t_();
        a.cx(c); c.t();
        b.cx(c); c.t_();
        a.cx(c); b.t(); c.t().h();
        a.cx(b).t(); b.t_();
        a.cx(b);
      }
    }
    return a;
  }
  
  cu1(param, target) {
    target = this.getTarget(target);
    if (target) {
      var gate = 'cu1(' + param + ')';
      this.operation(gate+" _q_,_qt_;".replaceAll("_qt_", target.name));
    }
  }
  
  cu1$(param, target) {
    if (!this.isQBit(target)) target = this.Q.bit(target, this.reg);
    if (target) {
      this.u([param+'/2']);
      this.acx(target);
      target.u(['-'+param+'/2']);
      this.acx(target);
      target.u([param+'/2']);
    }
    return this;
  }
  
  rcnot(target) { return this.rcx(target); }
  
  rcx(target) {
    target = this.getTarget(target);
    if (target) {
      if (target > this.index) {
        this.h(); target.h();
      } else {
        target.h(); this.h();
      }
      this.cx(target);
      if (target > this.index) {
        this.h(); target.h();
      } else {
        target.h(); this.h();
      }
    }
    return this;
  }
  
  swapWith(target) {
    return this.cx(target).rcx(target).cx(target);
  }
  
  measure() {
    var index = (this.index > -1) ? this.index: undefined;
    return this.measureTo(index);
  }
  
  measureTo(index, group) {
    if (this.Q != undefined) {
      var cbit;
      if (typeof index === 'object' || index instanceof CBit) {
        cbit = index;
      } else {
        cbit = this.Q.cbit(index, group);
      }
      if (cbit) {
        this.operation("measure _q_ -> _c_;".replaceAll("_c_", cbit.name));
        if (index == undefined || index < 0 || index instanceof String) 
          this.Q.valMeasureSize(this, cbit);
      }      
    }
    return this;
  }
  
  toW() { return this.s().h().t().h(); }
  toV() { return this.s().h().t_().h(); }
  toX() { return this.h(); }
  toY() { return this.s_().h() }
  toZ() { return this; }
  
  measureW(index, group) { return this.toW().measureTo(index, group); }
  measureV(index, group) { return this.toV().measureTo(index, group); }
  measureX(index, group) { return this.toX().measureTo(index, group); }
  measureY(index, group) { return this.toY().measureTo(index, group); }
  measureZ(index, group) { return this.toZ().measureTo(index, group); }
  
  brk() {
    if (this.Q) this.Q.brk();
    return this;
  }
  
  repeat(times, op, param) {
    for (var i = 0; i < times; i++) {
      if (param == undefined) {
        this[op]();
      } else {
        this[op](param);
      }
    }
    return this;
  }
  
  _if_(test, operations) {
    this.openConditional(test);
    operations(this);
    this.closeConditional();
    return this;
  }
  
  _if(cbit, operations) {
    if (typeof cbit === 'string' || cbit instanceof String) {
      cbit = Q.cbit(cbit);
    }
    if (operations == undefined) {
      this.pre("if("+cbit.test+") ");
    } else {
      this.openConditional(cbit.test);
      operations(this);
      this.closeConditional();
    }
    
    return this;
  }
  
  isArray(v) {
    return Object.prototype.toString.call(v)==='[object Array]';
  }
  
}

class CBit {
  constructor(reg, index, value){
    this.kind = "classical";
    this.reg = reg;
    this.index = (index == undefined || index == null) ? -1 : index;
    this.value = value;
    this.name = this.reg + (this.index == -1  ? "":("["+this.index+"]"));
    this.test = this.reg + "==1";
  }
  
  isTrue() { this.test =  this.reg + "==1"; return this;  }
  isFalse() { this.test = this.reg + "==0"; return this;   }
  logic(operation, to) { this.test = this.reg +  operation + to; return this;  }
  not() { this.test = "!" + this.reg; return this;  }
  equals(to) { this.test = this.logic("==", to); return this;  }
  notEqual(to) { this.test = this.logic("!=", to); return this;  }
  gt(to) { this.test = this.logic(">", to); return this;  }
  gte(to) { this.test = this.logic(">=", to); return this;  }
  lt(to) { this.test = this.logic("<", to); return this;  }
  lte(to) { this.test = this.logic("<=", to); return this;  }
}

var IBM_Q5_2017 = {
  'name': 'IBM_Q5_2017',
  'qreg': {
    'q':[
      [1,2], [2], [], [2,4], [2]
    ]
  },
  'creg': { 'c':5 }
}