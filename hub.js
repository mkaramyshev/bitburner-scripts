/** @param {NS} ns */
export async function main(ns) {
	var nodes = ns.scan()
	for (var j = 0; j < nodes.length; j++) {
		var currentNodes = ns.scan(nodes[j])
		for (var i = 0; i < currentNodes.length; i++) {
			if (nodes.indexOf(currentNodes[i]) == -1) {
				nodes.push(currentNodes[i])
			}
		}
	}
	//теперь nodes - это список всех узлов в сети

	let pwnedHosts = [];
	function smartPWN(n) {
		let openedPorts = 0;
		if (ns.getServerRequiredHackingLevel(n) <= ns.getHackingLevel()) {
			if (ns.fileExists("BruteSSH.exe", "home")) {
				ns.brutessh(n);
				openedPorts++;
			}
			if (ns.fileExists("FTPCrack.exe", "home")) {
				ns.ftpcrack(n);
				openedPorts++;
			}
			if (ns.fileExists("relaySMTP.exe", "home")) {
				ns.relaysmtp(n);
				openedPorts++;
			}
			if (ns.getServerNumPortsRequired(n) <= openedPorts.toString()) {
				ns.nuke(n);
				pwnedHosts.push(n);
			}
		}
	}
	nodes.forEach(node => smartPWN(node)) //pwnedHosts - all hacked nodes

	var worthy = []
	for (var i = 0; i < pwnedHosts.length; i++) {
		if (ns.getServerMaxMoney(pwnedHosts[i]) > 0) {
			worthy.push(pwnedHosts[i])
		}
	}
	var threadsPerHost = (ns.getServerMaxRam(ns.getHostname()) / worthy.length)
	threadsPerHost = threadsPerHost/2
	function smartHack(h) {
		if (ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname()) > 3) {
			if ((ns.getServerMoneyAvailable(h) * 2) > ns.getServerMaxMoney(h)) {
				ns.run("hack.js", threadsPerHost/ns.getScriptRam("hack.js"), h)
			} else { ns.run("grow.js", threadsPerHost/ns.getScriptRam("grow.js"), h) }
			if (ns.getServerSecurityLevel(h) > ns.getServerMinSecurityLevel(h)) {
				ns.run("weaken.js", threadsPerHost/ns.getScriptRam("weaken.js"), h)
			}
		}
		
	}
	while (true) {
		worthy.forEach(el => smartHack(el))
		await ns.sleep(5000)
	}
}
