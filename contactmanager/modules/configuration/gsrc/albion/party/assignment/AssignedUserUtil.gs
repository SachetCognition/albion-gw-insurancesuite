package albion.party.assignment

uses gw.api.database.Query
uses gw.api.database.QuerySelectColumns
uses gw.api.database.Relop
uses gw.api.path.Paths

/**
 * Vendor auto-assignment used by preupdate rule ABPU3000 (Subtype AB--Vendor).
 */
class AssignedUserUtil {

  /**
   * Assigns the contact to the "Contact Manager" user with the fewest assigned contacts.
   * Ties go to the first such user by last name. Does not commit.
   */
  public static function selectLeastBusyUser(ABContactNeedingReassignment: ABContact): void {
    var roleQuery = Query.make(Role)
    roleQuery.compare(Role#Name, Relop.Equals, "Contact Manager")

    var userRoleQuery = Query.make(UserRole)
    userRoleQuery.subselect(UserRole#Role, CompareIn, roleQuery,Role#ID)

    var contactManagerQuery = Query.make(User)
    contactManagerQuery.subselect(User#ID, CompareIn, userRoleQuery, UserRole#User)
    var contactManagerResultSet = contactManagerQuery.select()
    contactManagerResultSet.orderBy(QuerySelectColumns.path(Paths.make(User#Contact, UserContact#LastName)))
    var leastBusyUserContacts = Query.make(ABContact)
    var leastBusyUser = contactManagerResultSet.FirstResult
    if (leastBusyUser !=null){
      leastBusyUserContacts.compare(ABContact#AssignedUser, Relop.Equals, leastBusyUser)
      var leastBusyUserContactsResultSet = leastBusyUserContacts.select()
      for (currentUser in contactManagerResultSet) {
        var currentUserContacts = Query.make(ABContact)
        currentUserContacts.compare(ABContact#AssignedUser, Relop.Equals, currentUser)
        var currentUserContactsResultSet = currentUserContacts.select()
        if (currentUserContactsResultSet.Count < leastBusyUserContactsResultSet.Count) {
          leastBusyUser = currentUser
          leastBusyUserContacts.compare(ABContact#AssignedUser, Relop.Equals, leastBusyUser)
          leastBusyUserContactsResultSet = leastBusyUserContacts.select()
        }
        ABContactNeedingReassignment.AssignedUser = leastBusyUser
      }
    }
  }
}
