import * as http from 'http';
import * as vscode from 'vscode';
import { GitExtension, Repository } from './git';

export function activate(context: vscode.ExtensionContext) {
	console.log('Successfully activated "WhatTheCommit"');
	
	context.subscriptions.push(vscode.commands.registerCommand("wtc.getCommitMessage",
		(repository: Repository) => {
			repository = GetRepo(repository);

			const addPermalink = vscode.workspace.getConfiguration().get('wtc.addPermalink') as boolean;

			http.get("http://www.whatthecommit.com/index.json", (resp) => {
				let data = '';
				resp.on('data', (chunk) => {
					data += chunk;
				});
				resp.on('end', () => {
					let myData = JSON.parse(data);
					const permaLink = addPermalink ? "\npermalink: " + myData.permalink : "";
					repository.inputBox.value = myData.commit_message + permaLink;
				});
			}).on("error", (err) => {
				vscode.window.showErrorMessage("Unable to connect to whatthecommit.com: " + err.message, { modal: true });
			});

		}, { repository: true }));

		vscode.commands.executeCommand('setContext', 'wtc.enabled', true);
}


function GetRepo(repository: Repository | undefined): Repository {
	if (repository === undefined) {
		let gitExtension = vscode?.extensions?.getExtension<GitExtension>('vscode.git')?.exports;
		let api = gitExtension?.getAPI(1);
		repository = api?.repositories[0];
	}

	return repository as Repository;
}