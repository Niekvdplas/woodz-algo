# from ortools.linear_solver import pywraplp
from flask import Flask, Response, request, jsonify
app = Flask(__name__)
from copy import deepcopy

def process_data(data):
    processed = {}
    for item in data:
        if item['afmeting'] in processed:
            if item['lengte'] != 0 and item['lengte'] != '':
                processed[item['afmeting']].append(int(item['lengte']))
        else:
            if item['lengte'] != 0 and item['lengte'] != '':
                processed[item['afmeting']] = [int(item['lengte'])]

    return processed

def optimal_res(weights, weight_left):
    n = len(weights)
    dp = [[0 for _ in range(weight_left+1)] for _ in range(n+1)]
    items = [[[] for _ in range(weight_left+1)] for _ in range(n+1)]
    
    for i in range(1, n+1):
        for w in range(weight_left+1):
            if weights[i-1] + 3 <= w:
                if weights[i-1] + 3 + dp[i-1][w-weights[i-1]-3] > dp[i-1][w]:
                    dp[i][w] = weights[i-1] + 3 + dp[i-1][w-weights[i-1]-3]
                    items[i][w] = items[i-1][w-weights[i-1]-3] + [weights[i-1]]
                else:
                    dp[i][w] = dp[i-1][w]
                    items[i][w] = items[i-1][w]
            else:
                dp[i][w] = dp[i-1][w]
                items[i][w] = items[i-1][w]
    
    return weight_left - max(dp[-1]), items[n][dp[-1].index(max(dp[-1]))]

def get_sizes(key, data):
    available_sizes = []
    for entry in data:
        if entry['Beam_Size'] == key:
            available_sizes.append(entry['length'])
    return available_sizes

@app.route('/', methods = ['POST', 'GET'], defaults={'path': ''})
@app.route('/<path:path>', methods=['POST', 'GET'])
def catch_all(path):
    data = request.get_json()
    processed_data = process_data(data['data'])
    return_data = {}
    for key in processed_data:
        return_data[key] = []
        bins = [] #get_sizes(key, data['added_bins'])
        while processed_data[key] != []:
            length = 0
            if bins == []:
                length = 6000
                sorted(processed_data[key], reverse=True)
            else:
                length = bins.pop(0)
                processed_data[key] = sorted(processed_data[key])
            k = optimal_res(deepcopy(processed_data[key]), length)
            if length != 6000 and (k[0] > 150 and k[0] < 1000):
                continue
            if k[0] != length:
                return_data[key].append([length, deepcopy(k)])
            processed_data[key] = [i for i in processed_data[key] if not i in k[1] or k[1].remove(i)]
    return jsonify(return_data)

