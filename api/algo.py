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

def optimal_res(weight_left, weights, combination):
    if weight_left == 0:
        return 0, combination
    if weights == []:
        return weight_left, combination
    if all(i + 3 > weight_left for i in weights):
        return weight_left, combination
    curr_weight = weights.pop(0)
    if curr_weight > weight_left:
        return weight_left, []
    if curr_weight + 3 <= weight_left:
        comb1 = deepcopy(combination)
        comb2 = deepcopy(combination)
        comb2.append(curr_weight)
        val_1 = optimal_res(weight_left, deepcopy(weights), comb1)
        val_2 = optimal_res((weight_left - curr_weight - 3), deepcopy(weights), comb2)
        if val_1[0] < val_2[0]:
            return val_1
        else:
            return val_2

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
        bins = get_sizes(key, data['added_bins'])
        while processed_data[key] != []:
            length = 0
            if bins == []:
                length = 6000
                sorted(processed_data[key], reverse=True)
            else:
                length = bins.pop(0)
                processed_data[key] = sorted(processed_data[key])
            k = optimal_res(length, deepcopy(processed_data[key]), [])
            if length != 6000 and (k[0] > 150 and k[0] < 1000):
                continue
            if k[0] != length:
                return_data[key].append([length, deepcopy(k)])
            processed_data[key] = [i for i in processed_data[key] if not i in k[1] or k[1].remove(i)]        

    return jsonify(return_data)

