# Delivery service server

API is available at https://deliveries-eyar.herokuapp.com

SwaggerUI is at https://deliveries-eyar.herokuapp.com/api

/authenticate

POST /authenticate

    Register or login
    
    Mandatory: email, password, userType: 'SENDER'/'COURIER'
    Optional: 
      sender: companyName
      courier: firstName, lasttName, phoneNumber, vehicleType

    Response: token
      Subsequent requests should include header: Auhtorization: Bearer ${token}

/delivery

POST /delivery

    Add delivery, allowed for senders only
    Optional: packageSize, cost, description

POST /delivery/assign

    Assign a courier to a delivery
    Mandatory: deliveryId, courierId

GET /delivery

    Get deliveries. Endpoint is paged.
    Senders - deliveries added
    Couriers - deliveries assigned

    params: date, page

GET /delivery/revenue

    For Couriers - get revenue, possibly for range of dates

    params: from, to - date strings

