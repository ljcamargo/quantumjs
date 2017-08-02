class QuantumJS {
  
  constructor(topology) {
    String.prototype.format = function () {
      var i = 0, args = arguments;
      return this.replace(/{}/g, function () {
        return typeof args[i] != 'undefined' ? args[i++] : '';
      });
    };

    this.operations = [];
    this.inits = [];
    this.creg = {};
    this.qreg = {};
    this.fnc = {};
    
    this.π = {
      div: (num) => {
        num = num || 1;
        return 'pi/' + num;
      }
    };

    this.backends = {
      'ibmqx2': {
        'name': 'ibmqx2',
        'registries': [
          {
            'kind':'quantum',
            'name':'q',
            'length': 5,
            'coupling_map': [[0,1],[0,2],[1,2],[3,2],[3,4],[4,2]],
            'topology': [[1,2],[2],[],[2,4],[2]]
          },
          {
            'kind':'classical',
            'name':'c',
            'length': 5
          }
        ]
      },
      'ibmqx3': {
        'name': 'ibmqx3',
        'registries': [
          {
            'kind':'quantum',
            'name':'q',
            'length': 16,
            'coupling_map': [[0,1],[1,2],[2,3],[3,14],[4,3],[4,5],[6,7],[6,11],[7,10],[8,7],[9,8],[9,10],[11,10],[12,5],[12,11],[12,13],[13,4],[13,14],[15,0],[15,14]],
            'topology': [[1],[2],[3],[14],[3,5],[],[7,11],[10],[7],[8,10],[],[10],[5,11,13],[4,14],[],[0,14]]
          },
          {
            'kind':'classical',
            'name':'c',
            'length': 16
          }
        ]
      }
    };

    this.$ = {
      "nobackend":"Backend {} not defined",
      "unequal":"Measurement classical register {} has not equal size to quantum register {}",
      "qerr":"Qubit {}({}) not defined in current topology",
      "cerr":"Classical bit {}({}) not defined in current topology",
      "notconnected":"Control {}({}) cannot operate on {}({}) on this topology.",
      "orphan":"Qbit({}) not attached to topology"
    };

    this.errors = {
      nobackend: (name) => this.error(this.$["nobackend"].format(name)),
      biterr: (str, reg, i) => this.error(this.$[str].format(reg, i)),
      qbit: (reg, i) => this.errors.biterr("qerr", reg, i),
      cbit: (reg, i) => this.errors.biterr("cerr", reg, i),
      unequal: (c,b) => this.error(this.$['unequal'].format(c,b)),
      orphan: (i) => this.error(this.$['orphan'].format(i)),
      notconn: (reg, i, reg2, i2) => this.error(this.$['notconnected'].format(reg, i, reg2, i2))
    }

    if (typeof topology === 'string' || topology instanceof String) {
      if (this.backends[topology] != undefined) {
        this.topology = this.backends[topology];
      } else {
        this.errors.nobackend(topology);
        return;
      }
    } else if (typeof topology !== 'undefined') {
      this.topology = topology;
    }
    this.constrained = typeof topology !== 'undefined';
    if (this.constrained) {
      this.topology.registries.forEach(reg => {
        if (reg.kind == 'quantum') this.setQ(reg.name, reg.length, reg.topology);
        if (reg.kind == 'classical') this.setC(reg.name, reg.length);
      });
    }
  }

  addFunction(name, fnc) {
    this.fnc[name] = (() => {
      return (...args) => {
          fnc.apply(this, args);
          return Q;
      };
    })();
  }

  couplingToConn(map) {
    var arr = [];
    map.forEach(val => {
      if (typeof arr[val[0]] === 'undefined') arr[val[0]] = [];
      arr[val[0]].push(val[1]);
    });
    for(var i = 0; i < arr.length; i++) arr[i] = arr[i] || [];
    console.log(JSON.stringify(arr));
    return arr;
  }
  
  setFallback(fallback) {
    this.fallback = fallback;
  }
  
  setQ(reg = 'c', size = 0, topologies) {
    this.qreg[reg] = this.qreg[reg] || new Array(size);
    var registry = this.qreg[reg];
    for (var i = 0; i < size; i++) {
      registry[i] = new QBit(reg, i, this, topologies ? topologies[i] : undefined);
    }
  }
  
  setC(reg = 'c', size = 0) {
    this.creg[reg] = this.creg[reg] || new Array(size);
    this.creg[reg].fill(0)
  }
  
  assertSize(qbit, cbit, top) {
    if (this.constrained) {
      if (this.qreg[qbit.reg].length != this.creg[cbit.reg].length) {
        this.errors.unequal(cbit.reg, qbit.reg);
      } else {
        return true;
      }
    } else {
      top = top || this.qreg[qbit.reg].length-1;
      var max = Math.max(top, this.creg[cbit.reg].length) +1;
      this.setQ(qbit.reg, max);
      this.setC(cbit.reg, max);
    }
  }
  
  init(array = [], reg = 'q') {
    array.forEach((val, i) => {
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
    });
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
        
    
    if (!this.constrained) { //UNCONSTRAINED TOPOLOGY
      if (this.qreg[reg] == undefined) this.qreg[reg] = []; 
      if (this.qreg[reg][index] == undefined) this.qreg[reg][index] = new QBit(reg, index, this);
      return this.qreg[reg][index];
    } else if (this.qreg[reg] != undefined) {
      if (this.qreg[reg][index] != undefined) {
        return this.qreg[reg][index];
      } else if (index == undefined) {
        return new QBit(reg, index, this);
      } else {
        this.errors.qbit(reg, index);
        return new QBit(reg, index, this);
      }
    } else {
      this.errors.qbit(reg, index);
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

    if (!this.constrained) { //UNCONSTRAINED TOPOLOGY
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
      if (this.creg[reg] >= index) {
        return new CBit(reg, index, this.creg[reg][index]);
      } else {
        this.errors.cbit(reg, index);
        return new CBit(reg, index, 0);
      }
    } else {
      this.errors.cbit(reg, index);
      return new CBit(reg, index, 0);
    }
  }
  
  exists(index, reg = 'q') {
    if (!this.constrained) return true;
    return this.qreg[reg][index] != undefined ? true : false;
  }

  operation(operation, target, scope, condition="") {
    if (Array.isArray(target)) target = target.join(",");
    var str = condition.length > 0 ? condition + " " : "";
    str += operation + " " + target + ";"
    this.add(str, scope);
  }

  assign(operation, origin, destiny, scope, condition="") {
    var str = condition.length > 0 ? condition + " " : "";
    str += operation + " " + origin + " -> " + destiny + ";"
    this.add(str, scope);
  }
  
  compile(callback) {
    var line = "\r\n";
    var header = "include \"qelib1.inc\";";
    var compiled = header + line + line;
    for (var key in this.qreg || {}) compiled += "qreg {}[{}];".format(key, this.qreg[key].length || 0) + line;
    for (var key in this.creg || {}) compiled += "creg {}[{}];".format(key, this.creg[key].length || 0) + line;
    compiled += line;
    compiled += this.inits.join(line);
    compiled += line;
    compiled += this.operations.join(line);
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
    indexes.forEach(i =>{
      var _bit = this.bit(i, reg);
      arr.push(_bit.name);
    });
    this.add("barrier " + (arr.join(',') || reg) + ";");
    return this;
  }
  
  brk() {
    this.add('');
    return this;
  }
  
  mask(mask, func) {
    mask.forEach((val, i) => { if (mask[i] == 1) func(Q.bit(i)); });
    return this;
  }
  
  pre(test) {
    this.operations[this.operations.length-1] = test + this.operations[this.operations.length-1];
  }
  
  error(message) {
    console.log("ERROR: " + message);
    this.add(">>>>>>> ERROR: " + message);
    if (this.fallback) this.fallback(message, this.compile());
    this.terminated = true;
  }
  
}


class QBit {
  constructor(reg, index, Q, targets) {
    this.kind = "quantum";
    this.scope = 'body';
    this.targets = targets;
    this.index = index == undefined ? -1 : index;
    this.reg = reg || 'q';
    this.name = this.reg + (this.index < 0 ? "":("["+this.index+"]"));
    if (Q != undefined) {
      this.Q = Q;
      this.attached = true;
    } else {
      this.Q = new QuantumJS();
      this.attached = false;
    }
  }
  
  bit(bit) { if (this.attached) this.Q.bit(bit); }
  
  error(message) { this.Q.error(message); }
  
  setIndex(index){
    this.index = index;
    return this;
  }
  
  setQ(Q) {
    this.Q = Q;
    this.attached = true;
    return this;
  }
  
  setScope(scope = 'body') {
    this.scope = scope;
  }
  
  openConditional(condition) { 
    this.condition = "if(" + condition + ") "; 
  }

  closeConditional() { 
    this.condition = undefined; 
  }
  
  validate(target) {
    if (this.targets == undefined || this.targets == null) return true;
    var targetIndex = target.index || target;
    return this.targets.indexOf(targetIndex) != -1;
  }
  
  pre(test) {
    this.Q.pre(test);
    return this;
  }
  
  gate(gate, bits){
    this.Q.operation(gate, bits || this.name);
    return this;
  }
  
  isQBit(obj) {
    return typeof obj === 'object' && obj instanceof QBit;
  }
  
  getTarget(target) {
    if (!this.isQBit(target)) target = this.Q.bit(target, this.reg);
    if (this.validate(target)) {
      return target; 
    } else {
      this.Q.errors.notconn(this.reg, this.index, target.reg, target.index);
    }
  }
  
  getTargetOrReverse(target) {
    if (this.validate(target)) {
      return 2; 
    } else if (target.validate(this)) {
      return 1;
    } else {
      return 0;
    }
  }
  
  controlled(gate, target) {
    target = this.getTarget(target);
    if (target) this.Q.operation(gate, [this.name, target.name]);
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
  
  cu1(param, index) {
    var target = this.getTarget(index);
    if (target) {
      var gate = 'cu1(' + param + ')';
      this.Q.operation(gate, [this.name, target.name]);
    }
    return this;
  }
  
  cu1$(param, index) {
    var target;
    if (!this.isQBit(index)) target = this.Q.bit(index, this.reg);
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
        this.Q.assign("measure", this.name, cbit.name);
        if (index == undefined || index < 0 || index instanceof String) {
          this.Q.assertSize(this, cbit);
        } else {
          this.Q.assertSize(this, cbit, index);
        }
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