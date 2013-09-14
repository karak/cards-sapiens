$stdout.sync = true


use Rack::Static,
  :urls => ["public/"]

run Rack::Directory.new("public")
