var rbtGraph = new Graph({
  container: document.getElementById('rbt-box')
});

$('#rbt-btn').on('click', function(){
  var redColor = 'rgba(200, 20, 20, 0.5)';
  var redStroke = 'rgba(200, 20, 20, 0.8)';
  var newValue = $('$rbt-input').val();
  var newN = new Node({color: redColor, stroke: redStroke, onClick: onClick});
  newN.setMeta({color: 'red', value: newValue});
    //Insert into tree

    while ( (newN.getMeta().value != rbtGraph.primaryNode.getMeta().value) && (newN.getMeta().color === 'red') ) {
       if ( newN.parentNode === newN.parentNode.parentNode.parentNode.leftNode ) {
           /* If x's parent is a left, y is x's right 'uncle' */
           y = x->parent->parent->right;
           if ( y->colour == red ) {
               /* case 1 - change the colours */
               x->parent->colour = black;
               y->colour = black;
               x->parent->parent->colour = red;
               /* Move x up the tree */
               x = x->parent->parent;
               }
           else {
               /* y is a black node */
               if ( x == x->parent->right ) {
                   /* and x is to the right */
                   /* case 2 - move x up and rotate */
                   x = x->parent;
                   left_rotate( rbtGraph, x );
                   }
               /* case 3 */
               x->parent->colour = black;
               x->parent->parent->colour = red;
               right_rotate( rbtGraph, x->parent->parent );
               }
           }
       else {
           /* repeat the "if" part with right and left
              exchanged */
           }
       }
    /* Colour the root black */
    rbtGraph->root->colour = black;
});
