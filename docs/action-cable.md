# Action Cable

Action Cable integrates WebSockets with the rest of your Rails application. It allows for real-time features to be written in Ruby. Provides a client-side JavaScript framework and a server-side Ruby framework. Allows a continuous two-way communication between client and server, as opposed to http where the server only sends a response after getting a client request. 

* Connection: A single Action Cable server can handle multiple connection instances. A single user may have multiple WebSockets open to the application if they use multiple browser tabs or devices. The connection itself simply deals with authentication and authorization. The client of this connection object is called a consumer.

* Consumer: Client of a WebSocket connection. The consumer is created by the client-side JavaScript framework.

* Channels: A consumer can subscribe, through a connection, to multiple channels. Each channel encapsulates a logical piece of work (similar to a controller). For example, you could have a ChatChannel and an AppearancesChannel, and a consumer could be subscribed to either or both of these channels.

* Subscribers: The connection between the subscriber and the channel is, called a subscription. A consumer can act as a subscriber to a given channel any number of times. For example, a consumer could subscribe to multiple chat rooms at the same time. 

* Pub/Sub: Publish-Subscribe refers to a message queue paradigm where senders of information (publishers), send data to recipients (subscribers), without specifying individual recipients. Action Cable uses this approach to communicate between the server and many clients.

* Broadcastings: A broadcasting is a pub/sub link where anything transmitted by the broadcaster is sent directly to the channel subscribers who are streaming int that named broadcasting. This is called a Stream.

When a consumer subscribes to a channel they are "streaming" from that channel, and will receive the information which is broadcast to this stream, not the channel. The channel matches subscribers to streams, however, the data receved by the subscriber depends on the stream, no just the channel.

If you have personalized streams, multiple subscribers to the same channel may receive broadcast with very different data.


### Server side

#### Connections

As mentioned earlier, every WebSocket accepted by the server creates a connection which manages all the channels that a user subscribes to. The connection itself simply deals with authentication and authorization. The client of this connection object is called a consumer. An individual user will create one consumer-connection pair per browser tab, window, or device they have ope

In app/channels/application_cable/connection.rb:

```ruby
module ApplicationCable
  class Connection < ActionCable::Connection::Base
  end
end
```

You use the class above to authorize the incoming connection:

```ruby
# app/channels/application_cable/connection.rb
module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private
      def find_verified_user
        if verified_user = User.find_by(id: cookies.encrypted[:user_id])
          verified_user
        else
          reject_unauthorized_connection
        end
      end
  end
end
```

Here `identified_by` designates a connection identifier that can be used to find the specific connection later. Note that anything marked as an identifier will automatically create a delegate by the same name on any channel instances created of the connection.

This example relies on the fact that you will already have handled authentication of the user somewhere else in your application, and that a successful authentication sets an encrypted cookie with the user ID.<br>
As you may know, devise does set a cookie in the session. However, because Action Cable operates on its own separate server for WebSockets, it doesn’t have access to the session. Instead we can use the warden environment variable object. It does this as Devise is built on top of Warden, and sets the user on the warden middleware object.

#### Channels

A channel is a logical unit of work, not too different from what a controller does in a Rails app. It handles the incoming and outgoing information through a particular channel. If you have a Rails app handy you can take a look at `app/channels/application_cable/channel.rb`. This is the parent channel that any channels you create inherit from. This is where you can put any logic that should be shared across multiple channels rather than duplicating code.

#### Subscriptions

Each channel you create can be subscribed to by one or more clients. Messages can then be broadcast to that channel who will forward it to any subscribers.

### Client side

#### Connections

Consumers require an instance of the connection on the client side. This lives in `app/javascript/channels/consumer.js`.

```js
import { createConsumer } from "@rails/actioncable"
export default createConsumer()
```

This code creates a consumer that will try to establish a connection to /cable on your server. All channels you create will import this file and use it to create a subscription to the server.

### Client-server interactions

```sh
rails generate channel room
```

This will create the following files

```sh
create  app/channels/room_channel.rb
create  app/javascript/channels/room_channel.js
```


In `app/channels/room_channel.rb`:

```ruby
class RoomChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
```

Connection vs. Subscription: <br>
The main WebSocket handshake succeeded (connect), meaning authentication at the connection level (ApplicationCable::Connection) passed.<br>
Server-Side Rejection: <br>
Inside your Ruby channel (app/channels/some_channel.rb), your subscribed method ran code like reject or failed an authorization check (e.g., current user doesn't have access to the requested params).<br>
Client Cleanup: <br>
Rails Action Cable client receives the rejection message from the server, fires the frontend rejected() callback, and attempts to clean up/remove the subscription state locally by sending an unsubscribe frame or dropping the reference.

Another good example could be working with logged in users and guest users.

#### Streams

Streams are how Rails publishes broadcasts to subscribers. In order to register a subscription, once a connection is established, the subscribed method is called which should set up the stream.

Action Cable gives us two stream options. stream_from and stream_for.

The difference is that stream_from expects a string to identify the stream whereas stream_for operates on a model. Ultimately they produce something similar.

```ruby
def subscribed
  stream_from "room"
end

def subscribed
  room = Room.find_by(name: 'someroom')
  stream_for room
end
```

#### Broadcasting

Once you have the WebSocket server set up, you just need to broadcast to it from wherever is appropriate in your app. Usually it would be a controller.

Like streams, there are a couple of ways you can broadcast.

If you used stream_for then you can call broadcast_to directly on the room channel object itself, using it this way you’d pass at least two arguments. The first argument would be the room object that you initially set up the stream on, the other arguments would be the data you want to broadcast. This can either be a list of key value pairs, or an object that responds to to_json because ultimately the data is streamed in a json convertible format.

```ruby
def create
  @room = Room.find(params[:id])
  @message = @room.messages.build(message_params)
  @message.save

  # You can then broadcast to the room like follows
  RoomChannel.broadcast_to(@room, @message)
end
```

Rails automatically calls to_json on our message object. The alternative syntax would look something like

```ruby
RoomChannel.broadcast_to(@room, name: 'Kevin', dork_status: 'Ultimate')
```


#### play_move Data:

```ruby
{ "move"=> { 
    "color"=>"w",       <br >
    "piece"=>"q",       <br >
    "from"=>"d1",       <br >
    "to"=>"d4",         <br >
    "san"=>"Qxd4",      <br > 
    "flags"=>"c",       <br >
    "lan"=>"d1d4",      <br > 
    "before"=>"rnbqkbnr/pppp1ppp/8/8/3p4/4P3/PPP2PPP/RNBQKBNR w KQkq - 0 3", <br >
    "after"=>"rnbqkbnr/pppp1ppp/8/8/3Q4/4P3/PPP2PPP/RNB1KBNR b KQkq - 0 3",  <br >
    "captured"=>"p"     <br>
  },  <br >
  "fen"=>"rnbqkbnr/pppp1ppp/8/8/3Q4/4P3/PPP2PPP/RNB1KBNR b KQkq - 0 3",  <br > 
  "state"=>"in_progress",   <br >
  "pgn"=>"[Event \"Casual Game\"]\n[Site \"ChessPwa Server\"]\n[Date \"01/20/23\"]\n[EventDate \"?\"]\n[Round \"?\"]\n[Result \"1-0\"]\n[White \"?\"]\n[Black \"?\"]\n[ECO \"?\"]\n[WhiteElo \"?\"]\n[BlackElo \"?\"]\n[PlyCount \"?\"]\n\n1. e3 e5 2. d4 exd4 3. Qxd4 1-0",   <br> 
  "action"=>"play_move"    <br>
}






