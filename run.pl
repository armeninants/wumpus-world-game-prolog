:- [
	server
].

:- init_agent([4, 0.2, [1,1], 0]).
:- server(8083).
:- www_open_url('http://localhost:8083').