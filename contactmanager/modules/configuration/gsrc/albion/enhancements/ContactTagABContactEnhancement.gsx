package albion.enhancements

/**
 * Every new contact must carry at least one contact tag; used by NewContactPopup.afterEnter.
 */
enhancement ContactTagABContactEnhancement : entity.ABContact {

  function addDefaultTagToNewContact(): void {
    var defaultTag = new ABContactTag()
    defaultTag.Type = typekey.ContactTagType.TC_CLAIMPARTY
    this.addToTags(defaultTag)
  }
}
