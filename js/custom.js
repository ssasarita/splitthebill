var testPeople = [
  {name: "Spencer", amtPaid: 20, endAmtPaid: 40, pay: [], id: 0, edit: false},
  {name: "Devon", amtPaid: 10, endAmtPaid: 50, pay: [], id: 1, edit: false},
  {name: "Pamn", amtPaid: 0, endAmtPaid: 1, pay: [], id: 2, edit: false},
  {name: "Jim", amtPaid: 30, endAmtPaid: 0, pay: [], id: 3, edit: false},
  {name: "Joe", amtPaid: 30, endAmtPaid: 0, pay: [], id: 4, edit: false},
  {name: "Jim", amtPaid: 30, endAmtPaid: 0, pay: [], id: 5, edit: false},
  {name: "Jim", amtPaid: 30, endAmtPaid: 0, pay: [], id: 6, edit: false},
  {name: "Jim", amtPaid: 30, endAmtPaid: 0, pay: [], id: 7, edit: false}
];

var maxInputAmt = 999999;

// taken from https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function showPage() {
  var appContents = document.getElementById('app');
  appContents.style.display = "";
}

Vue.component('person-display', {
  props: {
    person: {
      validator: function (value) {
        if (typeof(value.name) === "string" && value.name.length > 0) {
          if (typeof(value.amtPaid) === "number") {
            if (typeof(value.endAmtPaid) === "number") {
              if (typeof(value.pay) === "object") {
                if (typeof(value.id) === "number") {
                  return true;
                }
              }
            }
          }
        }
        return false;
      }
    }
  },
  template: '\
    <form v-if="person.edit" class="mt-1 row form-inline">\
      <div class="col-5">\
        <input v-on:keyup.enter="update" v-on:focus="updateName" v-on:input="updateName" type="text" class="form-control" v-bind:value="person.name">\
      </div>\
      <div class="col-4">\
        <input v-on:keyup.enter="update" v-on:focus="updateAmt" v-on:input="updateAmt" class="form-control" name="amtPaid" type="number" min="0" step="0.01" data-number-to-fixed="2" data-number-stepfactor="100" v-bind:value="person.amtPaid">\
      </div>\
      <div class="col-3">\
        <button v-on:click="update" type="button" class="w-100 btn btn-outline-warning">\
          Done\
        </button>\
      </div>\
    </form>\
    <div v-else v-on:click="person.edit = true;" class="row mt-1">\
      <div style="cursor: pointer;" class="col-5">\
        {{ person.name }}\
      </div>\
      <div style="cursor: pointer;" class="col-4">\
        {{ "$" + person.amtPaid.toFixed(2) }}\
      </div>\
      <div class="col-3">\
        <button class="w-100 btn btn-outline-danger" v-on:click="deletePerson">\
          Delete\
        </button>\
      </div>\
    </div>\
  ',
  data: function () {
      return {
        inputAmt: "",
        inputName: ""
      }
  },
  methods: {
    deletePerson: function () {
      var person = this.person;
      var index = this.$root.$data.people.findIndex(p => (p.name == person.name && p.amtPaid == person.amtPaid));
      if (index > -1) {
        this.$root.$data.people.splice(index,1);
      }
      this.$root.$data.calculated = false;

      var numPeople = this.$root.numPeople;
      for (let i=0;i<numPeople;i++) {
        var person = this.$root.$data.people[i];
        person.id = i;
      }
      this.$emit('deletedperson');
    },
    update: function () {
      var sendData = [this.$el[0].value, this.$el[1].value, this.person.id];
      this.$emit('updated',sendData);
    },
    updateName: function () {
      this.inputName = this.person.name;
    },
    updateAmt: function () {
      this.inputAmt = this.person.amtPaid;
    }
  }
})

Vue.component('amts-owed', {
  props: ['payInfo'],
  template: '\
    <div class="col-sm-7">\
      {{ payInfo.personOwed }}\
    </div>\
    <div class="col-sm-5">\
      {{ payInfo.amtOwed }}\
    </div>'
})


var app = new Vue({
  el: '#app',
  data: {
    start: true,
    calculated: false,
    // name: "John Dough",
    // amtPaid: 0,
    people: [],
    amtsOwed: [],
    inputName: '',
    inputAmt: '',
    maxInputAmt: maxInputAmt
  },
  mounted: function () {
    showPage();
  },
  computed: {
    totalPaid () {
      return this.people.reduce((sum, person) => {
        return sum + person.amtPaid;
      }, 0)
    },
    numPeople () {
      return this.people.length;
    },
    avgPaid () {
      if (this.numPeople > 0) {
        return this.totalPaid/this.numPeople;
      } else {
        return 0;
      }
    },
    maxInputAmtStr () {
      return numberWithCommas(this.maxInputAmt);
    }
  },
  methods: {
    startApp: function () {
      this.$root.$data.start = true;
    },
    addToList: function () {
      var newName = this.$root.$data.inputName;
      var newAmtPaid = parseFloat(this.$root.$data.inputAmt);
      if (newName.length == 0) {
      this.resetFocus();
        return;
      }
      if (isNaN(newAmtPaid)) {
        newAmtPaid = 0;
      } else if (newAmtPaid > maxInputAmt) {
        return;
      }
      var newId = this.$root.$data.people.length;
      this.$root.$data.people.push({name: newName, amtPaid: newAmtPaid, endAmtPaid: newAmtPaid, pay: [], id: newId, edit: false});
      this.$root.$data.inputName = '';
      this.$root.$data.inputAmt = '';
      this.$root.$data.calculated = false;

      this.calculate();
      this.resetFocus();
    },
    updatePerson: function (arr) {
      var name = arr[0];
      var amtPaid = parseFloat(arr[1]);
      var index = arr[2];
      var person = this.people[index];

      if (name.length > 0) {
        person.name = name;
      }
      if (!isNaN(amtPaid) && amtPaid < maxInputAmt) {
        person.amtPaid = amtPaid;
      }
      person.edit = false;
      this.calculate();
      this.resetFocus();
    },
    resetFocus: function () {
      document.getElementById('nameInput').focus();
    },
    reset: function () {
      this.people = [];
      this.resetFocus();
    },
    personDeleted: function () {
      this.calculate();
      this.resetFocus();
    },
    calculate: function () {

      var numPeople = this.$root.numPeople;

      if (numPeople <= 1) {
        return;
      }

      for (let i=0;i<numPeople;i++) {
        var person = this.$root.$data.people[i];
        person.endAmtPaid = person.amtPaid;
        person.pay = [];
      }

      var totalPaid = this.$root.totalPaid;
      var avgPaid = this.$root.avgPaid;
      for (let i=0;i<numPeople;i++) {
        var person = this.$root.$data.people[i];
        var amtPaidBelowAvg = Math.round((avgPaid - person.endAmtPaid) * 100)/100;
        if (amtPaidBelowAvg > 0.0090) {
          for (let j=0;j<numPeople;j++) {
            if (i != j) {
              var otherPerson = this.$root.$data.people[j];
              var otherOverPaid = Math.round((otherPerson.endAmtPaid - avgPaid)*100)/100;
              if (otherOverPaid >= amtPaidBelowAvg) {
                this.$root.amtsOwed.push({
                  person: person,
                  owesPerson: otherPerson,
                  amt: amtPaidBelowAvg
                });
                var index = person.pay.length;
                person.pay.push({
                  personOwed: otherPerson.name,
                  amtOwed: Math.round(amtPaidBelowAvg * 100) / 100,
                  id: index
                })
                person.endAmtPaid += amtPaidBelowAvg;
                otherPerson.endAmtPaid -= amtPaidBelowAvg;
                break;
              } else if (otherOverPaid > 0) {
                this.$root.amtsOwed.push({
                  person: person,
                  owesPerson: otherPerson,
                  amt: otherOverPaid
                });
                var index = person.pay.length;
                person.pay.push({
                  personOwed: otherPerson.name,
                  amtOwed: Math.round(otherOverPaid * 100) / 100,
                  id: index
                })
                person.endAmtPaid += otherOverPaid;
                otherPerson.endAmtPaid -= otherOverPaid;
                amtPaidBelowAvg -= otherOverPaid;
              }
            }
          }
        }

      }
      this.$root.$data.calculated = true;
      for (let i=0;i<numPeople;i++) {
        var person = this.$root.$data.people[i];
        person.endAmtPaid = person.amtPaid;
      }
    }
  }
})
