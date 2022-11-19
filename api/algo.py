from ortools.linear_solver import pywraplp
from flask import Flask, Response, request, jsonify
app = Flask(__name__)

data = {}
data['bin_capacity'] = 6000

solver = pywraplp.Solver.CreateSolver('SCIP')

def solve(weights):
    weights = [x for x in weights if not x > data['bin_capacity']]
    weights.sort(reverse=True)
    for i, weight in enumerate(weights):
        if weight == 0:
            continue
        weights[i] = weight + 3

    data['weights'] = weights
    data['items'] = list(range(len(weights)))
    data['bins'] = data['items']
    beam_solution = [[]]
    # Variables
    # x[i, j] = 1 if item i is packed in bin j.
    x = {}
    for i in data['items']:
        for j in data['bins']:
            x[(i, j)] = solver.IntVar(0, 1, 'x_%i_%i' % (i, j))

    # y[j] = 1 if bin j is used.
    y = {}
    for j in data['bins']:
        y[j] = solver.IntVar(0, 1, 'y[%i]' % j)

    # Constraints
    # Each item must be in exactly one bin.
    for i in data['items']:
        solver.Add(sum(x[i, j] for j in data['bins']) == 1)

    # The amount packed in each bin cannot exceed its capacity.
    for j in data['bins']:
        solver.Add(
            sum(x[(i, j)] * data['weights'][i] for i in data['items']) <= y[j] *
            data['bin_capacity'])

    # Objective: minimize the number of bins used.
    solver.Minimize(solver.Sum([y[j] for j in data['bins']]))

    status = solver.Solve()

    if status == pywraplp.Solver.OPTIMAL:
        num_bins = 0.
        for j in data['bins']:
            if y[j].solution_value() == 1:
                bin_items = []
                bin_weight = 0
                for i in data['items']:
                    if x[i, j].solution_value() > 0:
                        bin_items.append(i)
                        bin_weight += data['weights'][i]
                        beam_solution[int(num_bins)].append(data['weights'][i])
                if bin_weight > 0:
                    beam_solution.append([])
                    num_bins += 1
                    print('Bin number', j)
                    print('  Items packed:', bin_items)
                    print('  Total weight:', bin_weight)
                    print()
        print()
        print(beam_solution[:-1])
        print('Number of bins used:', num_bins)
        return num_bins, beam_solution[:-1]
    else:
        print('The problem does not have an optimal solution.')

def process_data(data):
    processed = {}
    for item in data:
        if item['afmeting'] in processed:
            if item['lengte'] != 0 and item['lengte'] != '':
                print(item['lengte'])
                processed[item['afmeting']].append(int(item['lengte']))
        else:
            if item['lengte'] != 0 and item['lengte'] != '':
                processed[item['afmeting']] = [int(item['lengte'])]

    print(processed)
    return processed



@app.route('/', methods = ['POST', 'GET'], defaults={'path': ''})
@app.route('/<path:path>', methods=['POST', 'GET'])
def catch_all(path):
    data = request.get_json()
    processed_data = process_data(data)
    return_data = {}
    for key in processed_data:
        return_data[key] = solve(processed_data[key])
    return jsonify(return_data)

# app.run()



# @app.route('/', methods=['POST'])
# def catch_all():
#     data = request.get_json()
#     return_data = {}
#     for key in data:
#         print(key)
#         return_data[key] = solve(data[key])
    
#     return Response("<h1>Flask</h1><p>You visited: /%s</p>" % "data", mimetype="text/html")
    # return jsonify(return_data)

#app.run(debug=True)

# def create_data_model():
#     """Create the data for the example."""



# @app.route('/')
# def get_stuff():
#     data = create_data_model()

#     # Create the mip solver with the SCIP backend.
#     solver = pywraplp.Solver.CreateSolver('SCIP')

#     if not solver:
#         return

#     # Variables
#     # x[i, j] = 1 if item i is packed in bin j.
#     x = {}
#     for i in data['items']:
#         for j in data['bins']:
#             x[(i, j)] = solver.IntVar(0, 1, 'x_%i_%i' % (i, j))

#     # y[j] = 1 if bin j is used.
#     y = {}
#     for j in data['bins']:
#         y[j] = solver.IntVar(0, 1, 'y[%i]' % j)

#     # Constraints
#     # Each item must be in exactly one bin.
#     for i in data['items']:
#         solver.Add(sum(x[i, j] for j in data['bins']) == 1)

#     # The amount packed in each bin cannot exceed its capacity.
#     for j in data['bins']:
#         solver.Add(
#             sum(x[(i, j)] * data['weights'][i] for i in data['items']) <= y[j] *
#             data['bin_capacity'])

#     # Objective: minimize the number of bins used.
#     solver.Minimize(solver.Sum([y[j] for j in data['bins']]))

#     status = solver.Solve()

#     if status == pywraplp.Solver.OPTIMAL:
#         num_bins = 0.
#         for j in data['bins']:
#             if y[j].solution_value() == 1:
#                 bin_items = []
#                 bin_weight = 0
#                 for i in data['items']:
#                     if x[i, j].solution_value() > 0:
#                         bin_items.append(i)
#                         bin_weight += data['weights'][i]
#                 if bin_weight > 0:
#                     num_bins += 1
#                     print('Bin number', j)
#                     print('  Items packed:', bin_items)
#                     print('  Total weight:', bin_weight)
#                     print()
#         print()
#         print('Number of bins used:', num_bins)
#         print('Time = ', solver.WallTime(), ' milliseconds')
#         return Response("You hit the endpoint, /%s" % num_bins)
#     else:
#         print('The problem does not have an optimal solution.')

 