exports = async function(userObject, driverEmail, orderStatus) {

    
    /* 
        Author: Dillon Harless - dillonharless@gmail.com

        Accepts:
            userObject = {
                email: 'soandso@gmail.com',
                firstName: 'so',
                lastName: 'andso'
            }

            driverEmail = 'driveremail@gmail.com'

            orderStatus = 'inProgress' || 'complete'
        
        Action:
            Sends an email based on the args provided.
        
        Returns:
            { "MessageId": "xxx" }

    */
    
    // Create connection to ses
    const ses = context.services.get('AWS_SES').ses("us-east-1");

    // Instantiate the message_obj
    let message_obj = {
        Source: "covid.19.deliverytool@gmail.com",
        Destination: "", 
        Message: {
            Body: {
                Html: {
                  Charset: "UTF-8",
                  Data: `This is a message from user StayNeighbor!`
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Test Email From StayNeighbor."
            }
        }
    }

    

    let destination, data

    // User created an order
    if ( userObject.email && (!driverEmail && !orderStatus) ) {

        // Build requester message
        message_obj.Destination = { ToAddresses: [userObject.email] }
        message_obj.Message.Body.Html.Data = `Hey, ${userObject.firstName} ${userObject.lastName},\n\n
                                            StayNeighbor has received your order and it is being processed.
                                            `
        message_obj.Message.Subject.Data = 'We got your request! - StayNeighbor'

        // Send message
        const result = await ses.SendEmail(message_obj);
        console.log(EJSON.stringify(result));
        return result;

    }

    else if ( userObject.email && driverEmail && orderStatus ) {
      
        let res = {}

        // Build requester message
        message_obj.Destination = { ToAddresses: [userObject.email] }
        
        // Check whether it's an update for en route or completion
        // NOTE: SES had some issues with ternary operators so I went with regular if-else
        if ( orderStatus === "inProgress" ) {
          message_obj.Message.Body.Html.Data = `Hey, ${userObject.firstName} ${userObject.lastName},\n\n Our delivery driver is on the way with your order.` 
          message_obj.Message.Subject.Data = 'Your order is on the Way! - StayNeighbor'
        }
        else {
          message_obj.Message.Body.Html.Data = 'Thanks for using StayNeighbor. Get well soon!'
          message_obj.Message.Subject.Data = 'Your order has been delivered! - StayNeighbor'
        }

        // Send message
        const requester_result = await ses.SendEmail(message_obj);
        res.requester_result = requester_result
        console.log(EJSON.stringify(requester_result));

        // Build the driver message only if it's been assigned to them
        if ( orderStatus === "inProgress" ) {
            message_obj.Destination = { ToAddresses: [driverEmail] }
            message_obj.Message.Body.Html.Data = `You have been assigned a new order. The organization who assigned
                                            it should contact you soon. After you've delivered it, please use
                                            this link to mark it completed: bit.ly.jfasdfas`
            message_obj.Message.Subject.Data = `You have a new order waiting to be delivered! - StayNeighbor`

            // Send message
            const driver_result = await ses.SendEmail(message_obj);
            res.driver_result = driver_result
            console.log(EJSON.stringify(driver_result));
        }

        return res
    }
  
    
  };