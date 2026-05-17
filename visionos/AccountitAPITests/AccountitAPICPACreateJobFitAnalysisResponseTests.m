#import <XCTest/XCTest.h>
#import <AccountitAPI/AccountitAPI.h>
#import "AccountitAPIDTOTestSupport.h"

@interface AccountitAPICPACreateJobFitAnalysisResponseTests : XCTestCase
@end

@implementation AccountitAPICPACreateJobFitAnalysisResponseTests

- (void)testCopyingAndSecureCodingRoundTrip {
    [AccountitAPIDTOTestSupport assertCopyingAndSecureCodingRoundTripForDTOClass:[AccountitAPICPACreateJobFitAnalysisResponse class]];
}

@end
