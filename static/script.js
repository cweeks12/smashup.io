var app = new Vue({
    el: '#app',
    data: {
        username: '',
        email: '',
        password: '',
        login_email: '',
        login_password: '',
        selectedExpansions: [],
        playerTextEntry : "2",
        randomPlayerFactions: [],
        expansions: [],
        factions: [],
        user: {},
        token: '',
    },

    created: function() {
        this.token = 
            this.getExpansions();
        this.getFactions();
        this.token = localStorage.getItem('token');
        this.user = {id: localStorage.getItem('userId'), username: localStorage.getItem('username')};
    },
    computed: {
        loggedIn: function() {
            return !((this.token === '') || (this.token == 'undefined')|| (this.token == null)) ;
        },
        players: function() {
            return parseInt(this.playerTextEntry);
        }
    },
    methods: {
        getExpansions: function() {
            axios.get('/api/expansions').then((response) => {
                this.expansions = response.data;
            });
        },
        getFactions: function() {
            axios.get('/api/factions').then((response) => {
                this.factions = response.data;
            });
        },
        randomizeFactions: function() {
            axios.get('/api/factions/' + this.user.id + '/' + this.players,{headers: { 'Authorization': localStorage.token} } ).then(result => {
                console.log(result);
                this.randomPlayerFactions = result.data;
            });
        },
        selectExpansion: function(expansion) {
            if (event.srcElement.style.backgroundColor == ""){
            event.srcElement.style.backgroundColor = "#0f0";
            }
            else{event.srcElement.style.backgroundColor = "";}
                axios.post(('/api/expansions/' + this.user.id) , {expansion: expansion.id}, {
                    headers: { 'Authorization': localStorage.token} }).then( response => {
                    this.selectedExpansions = response.data;
                    console.log(this.selectedExpansions);
                });
        },
        register: function() {
            axios.post('/api/register', {email: this.email, username: this.username, password: this.password}).then(response => {
                this.user = response.data.user;
                this.token = response.data.token;
                if (this.token === ''){
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId', this.user.id);
                    localStorage.removeItem('username', this.user.username);
                }
                else {
                    localStorage.setItem('token', this.token);
                    localStorage.setItem('userId', this.user.id);
                    localStorage.setItem('username', this.user.username);
                }

                this.login_email= this.email;
                this.login_password= this.password;
                this.username= '';
                this.email= '';
                this.password= '';
            });
        },
        login: function() {
            axios.post('/api/login', {email: this.login_email, password: this.login_password}).then(response => {
                this.user = response.data.user;
                this.token = response.data.token;
                console.log(this.user.id);
                if (this.token === ''){
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId', this.user.id);
                    localStorage.removeItem('username', this.user.username);
                }
                else {
                    localStorage.setItem('token', this.token);
                    localStorage.setItem('userId', this.user.id);
                    localStorage.setItem('username', this.user.username);
                }
            });
        },
        doLogout: function() {
            this.token = '';
            localStorage.removeItem('token');
            localStorage.removeItem('userId', this.user.id);
            localStorage.removeItem('username', this.user.username);
        },
    },
    watch: {},
});
