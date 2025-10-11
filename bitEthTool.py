import requests
import networkx as nx
import matplotlib.pyplot as plt
from fpdf import FPDF
from fpdf.enums import XPos, YPos
from datetime import datetime
import re
from tqdm import tqdm
import networkx.algorithms.centrality as centrality
from networkx.algorithms.community import greedy_modularity_communities
# import random

# Base API Class
class BlockchainAPI:
    """Base class to handle different blockchain API integrations."""
    def get_address_info(self, address, limit):
        """Fetch information about a specific address."""
        raise NotImplementedError

    def get_transaction_info(self, txid):
        """Fetch transaction details."""
        raise NotImplementedError

    def get_exchange_rates(self):
        """Get current cryptocurrency exchange rates for conversion."""
        try:
            response = requests.get('https://api.coingecko.com/api/v3/exchange_rates')
            if response.status_code == 200:
                return response.json().get('rates')
            else:
                print(f"Error: Unable to fetch exchange rates. Status code: {response.status_code}")
                return None
        except Exception as e:
            print(f"Error fetching exchange rates: {e}")
            return None

# Bitcoin API Class
class BitcoinAPI(BlockchainAPI):
    def get_address_info(self, address, limit):
        url = f"https://blockchain.info/rawaddr/{address}"
        response = requests.get(url)
        try:
            if response.status_code == 200:
                data = response.json()
                return data.get("txs", [])[:limit] if isinstance(data, dict) else None
            else:
                print(f"Error: Received status code {response.status_code} from Bitcoin API.")
                return None
        except ValueError:
            print("Error: Non-JSON response from Bitcoin API.")
            return None

    def get_transaction_info(self, txid):
        url = f"https://blockchain.info/rawtx/{txid}"
        response = requests.get(url)
        try:
            if response.status_code == 200:
                data = response.json()
                return data if isinstance(data, dict) else None
            else:
                print(f"Error: Received status code {response.status_code} from Bitcoin API.")
                return None
        except ValueError:
            print("Error: Non-JSON response from Bitcoin API.")
            return None

# Ethereum API Class
class EthereumAPI(BlockchainAPI):
    def __init__(self, api_key):
        self.api_key = api_key

    def get_address_info(self, address, limit):
        url = f"https://api.etherscan.io/api?module=account&action=txlist&address={address}&sort=desc&apikey={self.api_key}"
        response = requests.get(url)
        try:
            if response.status_code == 200:
                data = response.json().get('result', [])
                return data[:limit] if isinstance(data, list) else None
            else:
                print(f"Error: Received status code {response.status_code} from Etherscan API.")
                return None
        except ValueError:
            print("Error: Non-JSON response from Etherscan API.")
            return None

    def get_transaction_info(self, txid):
        url = f"https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash={txid}&apikey={self.api_key}"
        response = requests.get(url)
        try:
            if response.status_code == 200:
                data = response.json().get('result')
                return data if isinstance(data, dict) else None
            else:
                print(f"Error: Received status code {response.status_code} from Etherscan API.")
                return None
        except ValueError:
            print("Error: Non-JSON response from Etherscan API.")
            return None

# Utility Function for Address Detection
def identify_blockchain(address):
    """Identify the blockchain type based on address format."""
    bitcoin_regex = r"^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,39}$"
    ethereum_regex = r"^0x[a-fA-F0-9]{40}$"
    
    if re.match(bitcoin_regex, address):
        return "bitcoin"
    elif re.match(ethereum_regex, address):
        return "ethereum"
    else:
        return None

# KYC/AML Information Extraction
class KYCAMLData:
    """Simulated KYC/AML data integration."""
    def __init__(self):
        self.known_wallets = {
            "0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97": {
                "owner": "John Doe",
                "risk_level": "High",
                "entity_type": "Individual"
            },
            "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa": {
                "owner": "Satoshi Nakamoto",
                "risk_level": "Unknown",
                "entity_type": "Unknown"
            }
        }

    def get_kyc_info(self, address):
        """Retrieve KYC information for a given address."""
        return self.known_wallets.get(address, {
            "owner": "Unknown",
            "risk_level": "Unknown",
            "entity_type": "Unknown"
        })

# Investigation Case Class with Enhanced Tracking
class InvestigationCase:
    def __init__(self, case_id, suspected_addresses, exchange_rates):
        self.case_id = case_id
        self.suspected_addresses = suspected_addresses
        self.transaction_data = []  
        self.history = {}  
        self.bounce_count = 0  
        self.exchange_rates = exchange_rates

    def convert_value_to_fiat(self, crypto_value, crypto_type):
        """Convert cryptocurrency value to USD and INR."""
        if not self.exchange_rates:
            return None, None

        try:
            crypto_value = float(crypto_value)
            if crypto_type.lower() == "bitcoin":
                btc_to_usd = self.exchange_rates.get("usd", {}).get("value")
                btc_to_inr = self.exchange_rates.get("inr", {}).get("value")
                if btc_to_usd and btc_to_inr:
                    value_in_btc = crypto_value / 1e8  # Convert Satoshis to BTC
                    return value_in_btc * btc_to_usd, value_in_btc * btc_to_inr
            elif crypto_type.lower() == "ethereum":
                eth_to_usd = self.exchange_rates.get("usd", {}).get("value")
                eth_to_inr = self.exchange_rates.get("inr", {}).get("value")
                if eth_to_usd and eth_to_inr:
                    value_in_eth = crypto_value / 1e18  # Convert Wei to ETH
                    return value_in_eth * eth_to_usd, value_in_eth * eth_to_inr
        except ValueError:
            print(f"Error: Unable to convert crypto value {crypto_value} to a number.")
        
        return None, None

    def add_transaction(self, from_addr, to_addr, txid, tx_details):
        """Add transaction details for tracking."""
        crypto_type = "Bitcoin" if "fee" in tx_details else "Ethereum"
        value = tx_details.get("value", 0)

        value_usd, value_inr = self.convert_value_to_fiat(value, crypto_type)

        transaction_record = {
            "from": from_addr,
            "to": to_addr,
            "txid": txid,
            "timestamp": tx_details.get("time") or tx_details.get("timeStamp"),
            "value": value,
            "value_usd": value_usd,
            "value_inr": value_inr,
            "fee": tx_details.get("fee") if "fee" in tx_details else None,
            "block": tx_details.get("block_height") or tx_details.get("blockNumber"),
            "confirmations": tx_details.get("confirmations"),
            "token_transfer": tx_details.get("tokenSymbol") if "tokenSymbol" in tx_details else None,
            "crypto_type": crypto_type,
            "nonce": tx_details.get("nonce"),
            "details": tx_details
        }

        self.transaction_data.append(transaction_record)
        self.history.setdefault(from_addr, []).append(transaction_record)
        self.history.setdefault(to_addr, []).append(transaction_record)

    def calculate_bounce_count(self):
        """Calculate bounce count based on repeated address interactions."""
        self.bounce_count = sum(
            1 for addr in self.history if len(self.history[addr]) > 1
        )
        print(f"Total Bounce Count: {self.bounce_count}")

    def calculate_risk_factor(self):
        """Calculate a simple risk factor based on bounce count and transaction history."""
        risk_score = 0
        print(f"Bounce Count: {self.bounce_count}")
        print(f"Number of Transactions: {len(self.transaction_data)}")

        if self.bounce_count > 5:
            risk_score += 20

        if len(self.transaction_data) > 50:
            risk_score += 30

        risk_score = min(risk_score, 100)
        print(f"Calculated Risk Score: {risk_score}")

        return risk_score

# Crypto Investigator Class with Transaction Tracking and Pattern Analysis
class CryptoInvestigator:
    def __init__(self, api, kyc_aml_data):
        self.api = api
        self.kyc_aml_data = kyc_aml_data
        self.graph = nx.DiGraph()  

    def trace_transactions(self, address, case, depth=2, limit=20):
        """Trace transactions to a specified depth with additional pattern analysis."""
        queue = [(address, 0)]
        visited = set()
        total_transactions = 0
        transaction_history = {}

        with tqdm(total=depth * limit, desc="Tracing Transactions", unit="tx") as pbar:
            while queue:
                addr, level = queue.pop(0)
                if addr in visited or level > depth:
                    continue

                visited.add(addr)
                address_info = self.api.get_address_info(addr, limit)
                if not address_info:
                    print(f"No transactions found for address {addr}.")
                    continue

                transactions = address_info

                for tx in transactions:
                    tx_id = tx.get("hash") or tx.get("transactionHash")
                    from_addr = tx.get("from")
                    to_addr = tx.get("to")
                    if from_addr and to_addr:
                        # Add nodes and edges to the graph
                        self.graph.add_node(from_addr)
                        self.graph.add_node(to_addr)
                        self.graph.add_edge(from_addr, to_addr, txid=tx_id)

                        # Add transaction to the case
                        case.add_transaction(from_addr, to_addr, tx_id, tx)

                        # Add to the queue for further exploration
                        queue.append((to_addr, level + 1))
                        
                        # Track transaction history for pattern analysis
                        transaction_history.setdefault(from_addr, []).append(to_addr)

                    total_transactions += 1
                    pbar.update(1)

        print(f"Total Transactions Traced for {address}: {total_transactions}")
        self.detect_circular_transactions(transaction_history)

    def detect_circular_transactions(self, transaction_history):
        """Detect circular transactions within the network."""
        print("\n=== Detecting Circular Transactions ===")
        for sender, receivers in transaction_history.items():
            for receiver in receivers:
                if sender in transaction_history.get(receiver, []):
                    print(f"Circular transaction detected between {sender} and {receiver}")

    def detect_mixers_or_tumblers(self):
        """Detect potential mixer or tumbler transactions."""
        print("\n=== Detecting Potential Mixer/Tumbler Activity ===")
        mixers = []
        for node in self.graph.nodes:
            if len(list(self.graph.successors(node))) > 10:  # Heuristic: more than 10 outgoing transactions
                print(f"Potential mixer or tumbler detected at address: {node}")
                mixers.append(node)
        return mixers

# Address Clustering with Connected Components
class AddressClusterAnalyzer:
    def __init__(self, investigator):
        self.investigator = investigator

    def identify_clusters(self):
        """Identify clusters using weakly connected components."""
        clusters = {}
        if self.investigator.graph:
            for i, component in enumerate(nx.weakly_connected_components(self.investigator.graph)):
                clusters[f"Cluster_{i+1}"] = list(component)
        return clusters

# Enhanced Visualization with Risk Scores
class EnhancedGraphVisualizer:
    def __init__(self, investigator):
        self.investigator = investigator

    def analyze_graph_metrics(self):
        """Calculate centrality metrics for key wallet identification."""
        graph = self.investigator.graph
        degree_centrality = centrality.degree_centrality(graph)
        betweenness_centrality = centrality.betweenness_centrality(graph)
        closeness_centrality = centrality.closeness_centrality(graph)

        print("\n=== Wallet Centrality Metrics ===")
        for node in graph.nodes:
            print(f"Wallet: {node}")
            print(f"  Degree Centrality: {degree_centrality[node]:.4f}")
            print(f"  Betweenness Centrality: {betweenness_centrality[node]:.4f}")
            print(f"  Closeness Centrality: {closeness_centrality[node]:.4f}")

        return {
            node: {
                "degree_centrality": degree_centrality[node],
                "betweenness_centrality": betweenness_centrality[node],
                "closeness_centrality": closeness_centrality[node]
            }
            for node in graph.nodes
        }

    def detect_communities(self):
        """Detect communities in the transaction graph."""
        graph = self.investigator.graph
        communities = list(greedy_modularity_communities(graph))
        
        print("\n=== Detected Communities ===")
        for i, community in enumerate(communities):
            print(f"Community {i + 1}: {list(community)}")
        
        return communities

    def visualize(self, save_as=None):
        """Visualize transaction graph with nodes and edges, enhanced with metrics."""
        graph = self.investigator.graph

        if not graph.nodes:
            print("No nodes in the graph to visualize.")
            return

        # Set up figure and axis
        fig, ax = plt.subplots(figsize=(14, 10))
        pos = nx.spring_layout(graph, k=0.3)

        # Draw nodes with different colors and sizes
        node_colors = [graph.degree(node) for node in graph]
        nodes = nx.draw_networkx_nodes(graph, pos, ax=ax,
                                       node_size=[100 + (deg * 30) for deg in node_colors],
                                       node_color=node_colors, cmap=plt.cm.plasma, alpha=0.7)

        # Draw edges
        nx.draw_networkx_edges(graph, pos, ax=ax, arrows=True, arrowstyle='->', arrowsize=10, edge_color='grey', alpha=0.5)

        # Draw labels for nodes
        nx.draw_networkx_labels(graph, pos, ax=ax, font_size=9, font_color='black', font_family='sans-serif')

        # Create a color bar for node degree
        sm = plt.cm.ScalarMappable(cmap=plt.cm.plasma, norm=plt.Normalize(vmin=min(node_colors), vmax=max(node_colors)))
        sm._A = []
        cbar = fig.colorbar(sm, ax=ax, orientation='vertical', fraction=0.05, pad=0.04)
        cbar.set_label("Number of Connections")

        ax.set_title("Enhanced Cryptocurrency Transaction Network Graph", fontsize=16)
        plt.xlabel("Wallet Address Relationship Overview", fontsize=12)
        plt.ylabel("Edge directions represent flow of funds", fontsize=10)

        if save_as:
            plt.savefig(save_as, format='png', dpi=300)
            print(f"Graph saved as {save_as}")

        plt.tight_layout()
        plt.show()

# Report Generation
class InvestigationReportGenerator:
    def __init__(self, case, clusters, risk_scores, graph_metrics, communities, mixers):
        self.case = case
        self.clusters = clusters
        self.risk_scores = risk_scores
        self.graph_metrics = graph_metrics
        self.communities = communities
        self.mixers = mixers

    def generate_report(self, graph_filename, filename=None):
        if filename is None:
            crypto_type = self.case.transaction_data[0]["crypto_type"] if self.case.transaction_data else "Unknown"
            wallet_address = self.case.suspected_addresses[0][:6] + "..." + self.case.suspected_addresses[0][-4:]
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"investigation_report_{crypto_type}_{wallet_address}_{timestamp}.pdf"
        
        pdf = FPDF()
        pdf.add_page()

        pdf.set_font("helvetica", "B", 16)
        pdf.cell(200, 10, "Cryptocurrency Investigation Report", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
        pdf.set_font("helvetica", "B", 14)
        pdf.cell(200, 10, f"Case ID: {self.case.case_id}", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
        pdf.cell(200, 10, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
        
        pdf.ln(10)

        pdf.set_font("helvetica", "B", 12)
        pdf.cell(200, 10, "Summary of Investigation", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font("helvetica", "", 10)
        pdf.multi_cell(200, 10, (
            "This report provides an overview of an investigation into the cryptocurrency wallet address. "
            "It includes details about transactions, clusters of linked addresses, and a risk assessment score "
            "to help determine the likelihood of criminal activity."
        ))

        pdf.ln(10)

        risk_factor = self.case.calculate_risk_factor()
        pdf.set_font("helvetica", "B", 12)
        pdf.cell(200, 10, "Risk Assessment", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font("helvetica", "", 10)
        pdf.multi_cell(200, 10, (
            f"The risk factor for this wallet address is: {risk_factor}%. "
            "This score is calculated based on the bounce count (number of times funds were moved back and forth) "
            "and the number of transactions. A higher score may indicate suspicious activity."
        ))

        pdf.ln(10)

        pdf.set_font("helvetica", "B", 12)
        pdf.cell(200, 10, "Mixers/Tumblers Detected", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font("helvetica", "", 10)
        if not self.mixers:
            pdf.cell(200, 10, "No potential mixers/tumblers detected.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        else:
            for mixer in self.mixers:
                pdf.cell(200, 10, f"Potential Mixer Address: {mixer}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        pdf.ln(10)

        pdf.set_font("helvetica", "B", 12)
        pdf.cell(200, 10, "Clusters Identified", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font("helvetica", "", 10)
        for cluster_id, addresses in self.clusters.items():
            pdf.cell(200, 10, f"{cluster_id}: {', '.join(addresses[:5])}...", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        pdf.ln(10)

        pdf.set_font("helvetica", "B", 12)
        pdf.cell(200, 10, "Centrality Metrics (Key Players)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font("helvetica", "", 10)
        for node, metrics in self.graph_metrics.items():
            pdf.multi_cell(200, 10, f"Address: {node}\n"
                                     f"  Degree Centrality: {metrics['degree_centrality']:.4f}\n"
                                     f"  Betweenness Centrality: {metrics['betweenness_centrality']:.4f}\n"
                                     f"  Closeness Centrality: {metrics['closeness_centrality']:.4f}\n"
                                     "-----------------------------------------------\n"
            )

        pdf.ln(10)

        pdf.set_font("helvetica", "B", 12)
        pdf.cell(200, 10, "Communities Detected", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font("helvetica", "", 10)
        for i, community in enumerate(self.communities):
            pdf.cell(200, 10, f"Community {i + 1}: {', '.join(list(community)[:5])}...", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        pdf.ln(10)

        pdf.set_font("helvetica", "B", 12)
        pdf.cell(200, 10, "Transaction Details", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font("helvetica", "", 10)
        for tx in self.case.transaction_data:
            pdf.multi_cell(200, 10, f"Transaction ID: {tx['txid']}\n"
                                     f"From: {tx['from']}\n"
                                     f"To: {tx['to']}\n"
                                     f"Value (in original crypto): {tx['value']}\n"
                                     f"Value in USD: {tx['value_usd']}\n"
                                     f"Value in INR: {tx['value_inr']}\n"
                                     f"Timestamp: {tx['timestamp']}\n"
                                     f"Block: {tx['block']}\n"
                                     f"Token Transfer: {tx['token_transfer']}\n"
                                     f"Confirmations: {tx['confirmations']}\n"
                                     "-----------------------------------------------\n"
            )

        pdf.add_page()
        pdf.image(graph_filename, x=10, y=10, w=190)

        pdf.output(filename)
        print(f"Report saved as {filename}")

# Main function to use the above classes
if __name__ == "__main__":
    address = input("Enter the address to investigate: ")
    blockchain = identify_blockchain(address)
    if not blockchain:
        print("Unsupported blockchain address format.")
    else:
        api = None
        if blockchain == "bitcoin":
            api = BitcoinAPI()
        elif blockchain == "ethereum":
            api_key = input("Enter your Etherscan API key: ")
            api = EthereumAPI(api_key)

        if api:
            exchange_rates = api.get_exchange_rates()
            case_id = "001"
            suspected_addresses = [address]
            case = InvestigationCase(case_id, suspected_addresses, exchange_rates)

            kyc_aml_data = KYCAMLData()
            investigator = CryptoInvestigator(api, kyc_aml_data)
            tracing_depth = int(input("Enter the tracing depth (recommended 1-3): "))
            limit = int(input("Enter the number of transactions to trace: "))
            investigator.trace_transactions(address, case, depth=tracing_depth, limit=limit)

            # Detect mixers/tumblers
            mixers = investigator.detect_mixers_or_tumblers()

            cluster_analyzer = AddressClusterAnalyzer(investigator)
            clusters = cluster_analyzer.identify_clusters()

            risk_scores = {addr: case.calculate_risk_factor() for addr in case.history}

            visualizer = EnhancedGraphVisualizer(investigator)
            graph_filename = f"graph_{blockchain}_{address[:6]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            visualizer.visualize(save_as=graph_filename)

            graph_metrics = visualizer.analyze_graph_metrics()
            communities = visualizer.detect_communities()

            report_generator = InvestigationReportGenerator(case, clusters, risk_scores, graph_metrics, communities, mixers)
            report_generator.generate_report(graph_filename)