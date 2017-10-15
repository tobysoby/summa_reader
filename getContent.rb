require 'httparty'

time_now = Time.now.to_i
time_24h_ago = (Time.now-(60 * 60 * 24)).to_i

# get the top entity
response = HTTParty.post('https://swarm.summa.leta.lv/api/queries/free-form-query/trending', 
    :body => {
	startEpochTimeSecs: time_24h_ago,
	endEpochTimeSecs: time_now,

	namedEntityFilterType: "AND",
	feedGroupIds: ["b1120829-7ab3-42cf-ab3d-0b87dd0fad01"],
	
	topResultOffset: 0,
	topResultCount: 3,
	doReturnTotalTopResultCount: true
}.to_json,
    :headers => { 'Content-Type' => 'application/json' } )

entity = response.parsed_response["result"]["topKEntities"].keys[0]
puts entity

# get the mediaItemSelection

response = HTTParty.post('https://swarm.summa.leta.lv/api/queries/free-form-query/mediaItemSelection?namedEntity=' + entity, 
    :body => {
	startEpochTimeSecs: time_24h_ago,
	endEpochTimeSecs: time_now,
	topResultOffset: 0,
	topResultCount: 2,
	namedEntityFilterType: "AND"
}.to_json,
    :headers => { 'Content-Type' => 'application/json' } )

puts id = response.parsed_response["result"]["mediaItems"][0]["id"]

# get the translation
response = HTTParty.get('https://swarm.summa.leta.lv/api/mediaItems/' + id)

translation = response.parsed_response["mainText"]["english"]
trans2 = translation.gsub /"/, '|'
puts trans2

# substitute 
text = File.read('./functions/data.js')
new_contents = text.gsub("Hello", trans2)
puts new_contents

# To write changes to the file, use:
File.open('./functions/data.js', "w") {|file| file.puts new_contents }

# deploy firebase app
system('firebase deploy')