/*	Wumpus World Server

	HTTP Server for Wumpus World game and agent

	Author: Armen Inants <armen@inants.com>
	License: GPL
*/

:- use_module(library(http/websocket)).
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_files)).
:- use_module(library(www_browser)).
:- use_module('agent/ww_hybrid_agent.pl').

:- http_handler(root(ws),
				http_upgrade_to_websocket(socket_handler, []),
				[spawn([])]).

% Serve static files of the client application
:- http_handler(root(.), http_reply_from_files('client/dist', []), [prefix]).

%! server(+Port:int) is det.
% 
%  Start a server at port Port

server(Port) :-
	http_server(http_dispatch, [port(Port)]).

%! socket_handler(?WebSocket:blob) is det.
% 
%  Receives and sends messages through WebSocket

socket_handler(WebSocket) :-
	ws_receive(WebSocket, Message, [
		format(json),
		tag(method),
		true(yes),
		false(no)
	]),
	(	Message.opcode == close
	->	true
	;	process_request(Message, Resp),
		ws_send(WebSocket, json(Resp)),
		socket_handler(WebSocket)
	).

%! process_request(+Req:dict, -Resp:string) is det.
% 
%  Execute a predicate specified in Req and return a response Resp

process_request(Req, Resp) :-
	(	select_dict(
			run_agent{percept:Percept}, 
			Req.data, 
			_)
	->	run_agent(Percept, Resp)

	;	select_dict(
			init_agent{settings:Settings}, 
			Req.data, 
			_)
	->	init_agent(Settings),
		Resp = true
	
	;	select_dict(
			restart_agent{}, 
			Req.data, 
			_)
	->	restart_agent,
		Resp = true
	
	;	select_dict(
			tell_action{action:Action}, 
			Req.data, 
			_)
	->	tell_action(Action),
		Resp = true
	
	;	Resp = 'wrong query'
	).
