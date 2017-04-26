:- use_module(library(pldoc)).
:- use_module(library(pldoc/doc_library)).

% :- doc_server(4000).
% :- portray_text(true).

:- [
	server,
	'agent/ww_hybrid_agent'
	].

:- doc_save(., [
		doc_root(doc),
		recursive(true)
	]).