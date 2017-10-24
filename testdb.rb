require 'firebase'

base_uri = 'https://testingthefirebasedata.firebaseio.com/'

firebase = Firebase::Client.new(base_uri,'JDBq1qKbE4mTQp1VeZZlnAhGdh8XvQcrZrGCKAkz')

response = firebase.push("todos", { :name => 'Pick the milk', :priority => 1 })
print response.success? # => true
print response.code # => 200
print response.body # => { 'name' => "-INOQPH-aV_psbk3ZXEX" }
print response.raw_body # => '{"name":"-INOQPH-aV_psbk3ZXEX"}'