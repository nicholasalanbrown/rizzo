require ['public/assets/javascripts/lib/core/shopping_cart'], (ShoppingCart) ->

  describe 'ShoppingCart', ->

    it 'is defined', ->
      expect(ShoppingCart).toBeDefined()

    it 'has a version', ->
      expect(ShoppingCart.version).toBeDefined()


    describe 'Empty basket', ->

      beforeEach ->
        document.cookie = 'shopCartCookie=""'
        loadFixtures('shopCart.html')
        @shoppingCart = new ShoppingCart()

      it 'hides the shopping basket element', ->
        nav = $('nav.js-user-nav')[0]
        expect($(nav)).not.toHaveClass('has-basket')

      it 'has an empty basket', ->
        basketItems = $('span.js-basket-items')[0].innerText
        expect(basketItems).toBe('')

    describe 'Has shopping items', ->

      beforeEach ->
        loadFixtures('shopCart.html')
        cartData = {"D":78,"F":2653,"A":["5904","5904-DIGITAL_ONLY"]}
        document.cookie = 'shopCartCookie=' + escape(JSON.stringify(cartData))
        @shoppingCart = new ShoppingCart()

      afterEach ->
        document.cookie = ''
        $('nav.js-user-nav').remove()

      it 'reads the shop cookie value', ->
        expect(@shoppingCart.cartData.A.length).toEqual(2);
        expect($('nav.js-user-nav')).toExist();

      it 'displays the basket element', ->
        nav = $('nav.js-user-nav')
        expect($(nav)).toHaveClass('has-basket')

      it 'shows the number of shopping items', ->
        basketItems = $('span.js-basket-items')[0].innerText
        expect(basketItems).toBe('2')

